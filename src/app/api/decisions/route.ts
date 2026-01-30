import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const action = searchParams.get("action");
    const ticker = searchParams.get("ticker");

    const where: Record<string, unknown> = { userId: DEFAULT_USER_ID };
    if (action) where.action = action;
    if (ticker) where.ticker = ticker.toUpperCase();

    const decisions = await prisma.decision.findMany({
      where,
      orderBy: { decisionDate: "desc" },
    });

    return NextResponse.json(decisions);
  } catch (error) {
    console.error("Error fetching decisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch decisions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ticker,
      action,
      priceAtDecision,
      thesis,
      reasoning,
      analysisId,
      holdingId,
    } = body;

    if (!ticker || !action) {
      return NextResponse.json(
        { error: "ticker and action are required" },
        { status: 400 }
      );
    }

    const decision = await prisma.decision.create({
      data: {
        userId: DEFAULT_USER_ID,
        ticker: ticker.toUpperCase(),
        action,
        priceAtDecision: priceAtDecision || null,
        thesis: thesis || null,
        reasoning: reasoning || null,
        analysisId: analysisId || null,
        holdingId: holdingId || null,
        outcome: "PENDING",
      },
    });

    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    console.error("Error creating decision:", error);
    return NextResponse.json(
      { error: "Failed to create decision" },
      { status: 500 }
    );
  }
}
