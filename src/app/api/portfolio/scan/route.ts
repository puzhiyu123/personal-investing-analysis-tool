import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { searchPerplexityBatch } from "@/lib/ai/perplexity";
import { generateClaudeJSON } from "@/lib/ai/claude";
import { getScanQueries } from "@/lib/ai/queries/scan-queries";
import {
  getScanSystemPrompt,
  getScanUserPrompt,
} from "@/lib/ai/prompts/portfolio-scan";
import { buildReportContext } from "@/lib/ai/report-context";
import type { PortfolioScanResult } from "@/lib/ai/prompts/portfolio-scan";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const scans = await prisma.portfolioScan.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        tickersScanned: true,
        alertsGenerated: true,
        summary: true,
        createdAt: true,
      },
    });
    return NextResponse.json(scans);
  } catch (error) {
    console.error("Error fetching scans:", error);
    return NextResponse.json(
      { error: "Failed to fetch scans" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { id: DEFAULT_USER_ID, name: "George" },
      });
    }

    // Guard: reject if a scan is already IN_PROGRESS
    const existingScan = await prisma.portfolioScan.findFirst({
      where: { userId: DEFAULT_USER_ID, status: "IN_PROGRESS" },
    });
    if (existingScan) {
      return NextResponse.json(
        { error: "A scan is already in progress", scanId: existingScan.id },
        { status: 409 }
      );
    }

    // Fetch all ACTIVE holdings
    const holdings = await prisma.holding.findMany({
      where: { userId: DEFAULT_USER_ID, status: "ACTIVE" },
    });

    if (holdings.length === 0) {
      return NextResponse.json(
        { error: "No active holdings to scan" },
        { status: 400 }
      );
    }

    const tickers = holdings.map((h) => h.ticker);

    // Create scan record
    const scan = await prisma.portfolioScan.create({
      data: {
        userId: DEFAULT_USER_ID,
        status: "IN_PROGRESS",
        tickersScanned: JSON.stringify(tickers),
      },
    });

    // Run scan in background (non-blocking)
    runScan(scan.id).catch((error) => {
      console.error("Portfolio scan failed:", error);
      prisma.portfolioScan
        .update({
          where: { id: scan.id },
          data: { status: "FAILED" },
        })
        .catch(console.error);
    });

    return NextResponse.json(scan, { status: 201 });
  } catch (error) {
    console.error("Error creating scan:", error);
    return NextResponse.json(
      { error: "Failed to create scan" },
      { status: 500 }
    );
  }
}

const SEVERITY_MAP: Record<string, number> = {
  CRITICAL: 3,
  WARNING: 2,
  INFO: 1,
};

async function runScan(scanId: string) {
  // Step 1: Fetch holdings
  const holdings = await prisma.holding.findMany({
    where: { userId: DEFAULT_USER_ID, status: "ACTIVE" },
  });

  // Step 2: Fetch latest COMPLETE macro report
  const macroReport = await prisma.macroReport.findFirst({
    where: { userId: DEFAULT_USER_ID, status: "COMPLETE" },
    orderBy: { createdAt: "desc" },
  });

  // Step 3: Build ticker list and run Perplexity queries
  const tickers = holdings.map((h) => h.ticker);
  const queries = getScanQueries(tickers);
  const perplexityResults = await searchPerplexityBatch(queries, {
    concurrency: 3,
  });

  // Step 4: Build macro context
  const macroContext = macroReport
    ? buildReportContext(macroReport as unknown as Record<string, unknown>)
    : null;

  // Step 5: Call Claude Haiku for screening
  const result = await generateClaudeJSON<PortfolioScanResult>(
    [
      {
        role: "user",
        content: getScanUserPrompt(
          holdings.map((h) => ({
            ticker: h.ticker,
            companyName: h.companyName,
            assetType: h.assetType,
            currentValue: h.currentValue,
            thesis: h.thesis,
            exitCriteria: h.exitCriteria,
          })),
          perplexityResults.map((r) => ({
            query: r.query,
            content: r.content,
          })),
          macroContext
        ),
      },
    ],
    {
      system: getScanSystemPrompt(),
      model: "claude-3-5-haiku-20241022",
      maxTokens: 4096,
      temperature: 0.2,
    }
  );

  // Step 6: Create alerts
  const alerts = result.alerts ?? [];
  for (const alert of alerts) {
    await prisma.portfolioAlert.create({
      data: {
        userId: DEFAULT_USER_ID,
        ticker: alert.ticker,
        alertType: alert.alertType,
        severity: alert.severity,
        severityLevel: SEVERITY_MAP[alert.severity] ?? 0,
        title: alert.title,
        description: alert.description,
        actionSuggested: alert.actionSuggested ?? null,
        source: "PORTFOLIO_SCAN",
        scanId,
      },
    });
  }

  // Step 7: Process watchlist suggestions
  const watchlistSuggestions = result.watchlistSuggestions ?? [];
  for (const suggestion of watchlistSuggestions) {
    try {
      await prisma.watchlistItem.create({
        data: {
          userId: DEFAULT_USER_ID,
          ticker: suggestion.ticker.toUpperCase(),
          companyName: suggestion.companyName,
          reason: suggestion.reason,
          status: "ACTIVE",
        },
      });
    } catch {
      // Unique constraint violation — ticker already on watchlist, skip silently
    }

    // Create a WATCHLIST_ADD alert
    await prisma.portfolioAlert.create({
      data: {
        userId: DEFAULT_USER_ID,
        ticker: suggestion.ticker.toUpperCase(),
        alertType: "WATCHLIST_ADD",
        severity: "INFO",
        severityLevel: 1,
        title: `Added ${suggestion.ticker.toUpperCase()} to watchlist`,
        description: suggestion.reason,
        source: "PORTFOLIO_SCAN",
        scanId,
      },
    });
  }

  // Step 8: Update scan record
  const totalAlerts = alerts.length + watchlistSuggestions.length;
  await prisma.portfolioScan.update({
    where: { id: scanId },
    data: {
      status: "COMPLETE",
      summary: result.summary ?? null,
      alertsGenerated: totalAlerts,
      rawData: JSON.stringify(result),
    },
  });
}
