import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analysis = await prisma.companyAnalysis.findUnique({
      where: { id },
    });
    if (!analysis) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Used primarily for updating question answers
    const updateData: Record<string, unknown> = {};
    if (body.generatedQuestions !== undefined) {
      updateData.generatedQuestions = JSON.stringify(body.generatedQuestions);
    }
    if (body.researchNotes !== undefined) {
      updateData.researchNotes = JSON.stringify(body.researchNotes);
    }

    const analysis = await prisma.companyAnalysis.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error updating analysis:", error);
    return NextResponse.json(
      { error: "Failed to update analysis" },
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
    await prisma.companyAnalysis.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return NextResponse.json(
      { error: "Failed to delete analysis" },
      { status: 500 }
    );
  }
}
