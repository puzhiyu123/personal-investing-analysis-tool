import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    const where: Record<string, unknown> = { userId: DEFAULT_USER_ID };
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const alerts = await prisma.portfolioAlert.findMany({
      where,
      orderBy: [{ severityLevel: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
