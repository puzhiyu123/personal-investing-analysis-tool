import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const holding = await prisma.holding.findUnique({ where: { id } });
    if (!holding) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(holding);
  } catch (error) {
    console.error("Error fetching holding:", error);
    return NextResponse.json(
      { error: "Failed to fetch holding" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      status,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (ticker !== undefined) updateData.ticker = ticker.toUpperCase();
    if (companyName !== undefined) updateData.companyName = companyName;
    if (assetType !== undefined) updateData.assetType = assetType;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (costBasis !== undefined) updateData.costBasis = costBasis;
    if (currentPrice !== undefined) updateData.currentPrice = currentPrice;
    if (entryDate !== undefined) updateData.entryDate = new Date(entryDate);
    if (thesis !== undefined) updateData.thesis = thesis;
    if (exitCriteria !== undefined) updateData.exitCriteria = exitCriteria;
    if (status !== undefined) updateData.status = status;

    // Recalculate derived fields
    if (quantity !== undefined || costBasis !== undefined) {
      const existing = await prisma.holding.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const q = quantity ?? existing.quantity;
      const cb = costBasis ?? existing.costBasis;
      updateData.totalCost = q * cb;
    }
    if (quantity !== undefined || currentPrice !== undefined) {
      const existing = await prisma.holding.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const q = quantity ?? existing.quantity;
      const cp = currentPrice ?? existing.currentPrice;
      updateData.currentValue = q * cp;
    }

    const holding = await prisma.holding.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(holding);
  } catch (error) {
    console.error("Error updating holding:", error);
    return NextResponse.json(
      { error: "Failed to update holding" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.holding.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting holding:", error);
    return NextResponse.json(
      { error: "Failed to delete holding" },
      { status: 500 }
    );
  }
}
