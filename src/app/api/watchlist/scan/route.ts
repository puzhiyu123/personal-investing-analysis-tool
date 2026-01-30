import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { searchPerplexityBatch } from "@/lib/ai/perplexity";
import { generateClaudeJSON } from "@/lib/ai/claude";
import { getWatchlistScanQueries } from "@/lib/ai/queries/watchlist-scan-queries";
import {
  getWatchlistScanSystemPrompt,
  getWatchlistScanUserPrompt,
} from "@/lib/ai/prompts/watchlist-scan";
import type { WatchlistScanResult } from "@/lib/ai/prompts/watchlist-scan";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const scans = await prisma.watchlistScan.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        tickersScanned: true,
        itemsChecked: true,
        summary: true,
        createdAt: true,
      },
    });
    return NextResponse.json(scans);
  } catch (error) {
    console.error("Error fetching watchlist scans:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist scans" },
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
    const existingScan = await prisma.watchlistScan.findFirst({
      where: { userId: DEFAULT_USER_ID, status: "IN_PROGRESS" },
    });
    if (existingScan) {
      return NextResponse.json(
        { error: "A watchlist scan is already in progress", scanId: existingScan.id },
        { status: 409 }
      );
    }

    // Fetch ACTIVE watchlist items
    const items = await prisma.watchlistItem.findMany({
      where: { userId: DEFAULT_USER_ID, status: "ACTIVE" },
    });

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No active watchlist items to scan" },
        { status: 400 }
      );
    }

    const tickers = items.map((item) => item.ticker);

    // Create scan record
    const scan = await prisma.watchlistScan.create({
      data: {
        userId: DEFAULT_USER_ID,
        status: "IN_PROGRESS",
        tickersScanned: JSON.stringify(tickers),
      },
    });

    // Run scan in background (non-blocking)
    runWatchlistScan(scan.id).catch((error) => {
      console.error("Watchlist scan failed:", error);
      prisma.watchlistScan
        .update({
          where: { id: scan.id },
          data: { status: "FAILED" },
        })
        .catch(console.error);
    });

    return NextResponse.json(scan, { status: 201 });
  } catch (error) {
    console.error("Error creating watchlist scan:", error);
    return NextResponse.json(
      { error: "Failed to create watchlist scan" },
      { status: 500 }
    );
  }
}

async function runWatchlistScan(scanId: string) {
  // Step 1: Fetch ACTIVE watchlist items
  const items = await prisma.watchlistItem.findMany({
    where: { userId: DEFAULT_USER_ID, status: "ACTIVE" },
  });

  // Step 2: Run Perplexity queries
  const tickers = items.map((item) => item.ticker);
  const queries = getWatchlistScanQueries(tickers);
  const perplexityResults = await searchPerplexityBatch(queries, {
    concurrency: 3,
  });

  // Step 3: Call Claude Haiku for evaluation
  const result = await generateClaudeJSON<WatchlistScanResult>(
    [
      {
        role: "user",
        content: getWatchlistScanUserPrompt(
          items.map((item) => ({
            ticker: item.ticker,
            reason: item.reason,
            targetPrice: item.targetPrice,
            targetCondition: item.targetCondition,
          })),
          perplexityResults.map((r) => ({
            query: r.query,
            content: r.content,
          }))
        ),
      },
    ],
    {
      system: getWatchlistScanSystemPrompt(),
      model: "claude-3-5-haiku-20241022",
      maxTokens: 4096,
      temperature: 0.2,
    }
  );

  // Step 4: Update each watchlist item with scan results
  const evaluations = result.evaluations ?? [];
  for (const evaluation of evaluations) {
    const matchingItem = items.find(
      (item) => item.ticker.toUpperCase() === evaluation.ticker.toUpperCase()
    );
    if (matchingItem) {
      await prisma.watchlistItem.update({
        where: { id: matchingItem.id },
        data: {
          lastChecked: new Date(),
          latestNote: evaluation.note,
        },
      });
    }
  }

  // Step 5: Mark scan COMPLETE
  await prisma.watchlistScan.update({
    where: { id: scanId },
    data: {
      status: "COMPLETE",
      summary: result.summary ?? null,
      itemsChecked: evaluations.length,
      rawData: JSON.stringify(result),
    },
  });
}
