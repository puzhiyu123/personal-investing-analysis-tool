import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const item = await prisma.watchlistItem.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating watchlist item:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist item" },
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
    await prisma.watchlistItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting watchlist item:", error);
    return NextResponse.json(
      { error: "Failed to delete watchlist item" },
      { status: 500 }
    );
  }
}
