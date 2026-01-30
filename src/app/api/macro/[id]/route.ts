import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.macroReport.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching macro report:", error);
    return NextResponse.json(
      { error: "Failed to fetch macro report" },
      { status: 500 }
    );
  }
}
