import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

async function ensureUser() {
  let user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  if (!user) {
    user = await prisma.user.create({
      data: { id: DEFAULT_USER_ID, name: "George" },
    });
  }
  return user;
}

export async function GET() {
  try {
    await ensureUser();
    const holdings = await prisma.holding.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(holdings);
  } catch (error) {
    console.error("Error fetching holdings:", error);
    return NextResponse.json(
      { error: "Failed to fetch holdings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureUser();
    const body = await request.json();
    const {
      ticker,
      companyName,
      assetType,
      quantity,
      costBasis,
      currentPrice,
      entryDate,
      thesis,
      exitCriteria,
    } = body;

    if (!ticker || quantity == null || costBasis == null) {
      return NextResponse.json(
        { error: "ticker, quantity, and costBasis are required" },
        { status: 400 }
      );
    }

    const totalCost = quantity * costBasis;
    const price = currentPrice || costBasis;
    const currentValue = quantity * price;

    const holding = await prisma.holding.create({
      data: {
        userId: DEFAULT_USER_ID,
        ticker: ticker.toUpperCase(),
        companyName: companyName || "",
        assetType: assetType || "EQUITY",
        quantity,
        costBasis,
        totalCost,
        currentPrice: price,
        currentValue,
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        thesis: thesis || null,
        exitCriteria: exitCriteria || null,
      },
    });

    return NextResponse.json(holding, { status: 201 });
  } catch (error) {
    console.error("Error creating holding:", error);
    return NextResponse.json(
      { error: "Failed to create holding" },
      { status: 500 }
    );
  }
}
