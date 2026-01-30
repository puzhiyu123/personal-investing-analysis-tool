import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const scan = await prisma.watchlistScan.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json(scan);
  } catch (error) {
    console.error("Error fetching watchlist scan:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist scan" },
      { status: 500 }
    );
  }
}
