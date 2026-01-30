import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const items = await prisma.watchlistItem.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker, companyName, reason, targetPrice, targetCondition } = body;

    if (!ticker) {
      return NextResponse.json(
        { error: "ticker is required" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        userId_ticker: {
          userId: DEFAULT_USER_ID,
          ticker: ticker.toUpperCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `${ticker.toUpperCase()} is already on your watchlist` },
        { status: 409 }
      );
    }

    const item = await prisma.watchlistItem.create({
      data: {
        userId: DEFAULT_USER_ID,
        ticker: ticker.toUpperCase(),
        companyName: companyName || "",
        reason: reason || null,
        targetPrice: targetPrice || null,
        targetCondition: targetCondition || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}
