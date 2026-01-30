import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["READ", "DISMISSED"].includes(status)) {
      return NextResponse.json(
        { error: "status must be READ or DISMISSED" },
        { status: 400 }
      );
    }

    const alert = await prisma.portfolioAlert.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const updated = await prisma.portfolioAlert.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
