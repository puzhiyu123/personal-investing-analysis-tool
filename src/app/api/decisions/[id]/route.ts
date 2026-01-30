import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decision = await prisma.decision.findUnique({ where: { id } });
    if (!decision) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(decision);
  } catch (error) {
    console.error("Error fetching decision:", error);
    return NextResponse.json(
      { error: "Failed to fetch decision" },
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

    const decision = await prisma.decision.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(decision);
  } catch (error) {
    console.error("Error updating decision:", error);
    return NextResponse.json(
      { error: "Failed to update decision" },
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
    await prisma.decision.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting decision:", error);
    return NextResponse.json(
      { error: "Failed to delete decision" },
      { status: 500 }
    );
  }
}
