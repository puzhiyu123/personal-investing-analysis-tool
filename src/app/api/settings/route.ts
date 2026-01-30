import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_USER_ID = "default";

export async function GET() {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });
    if (!settings) {
      return NextResponse.json({
        allocationTargets: {
          liquid: 65,
          equities: 12.5,
          crypto: 10,
          bonds: 7.5,
          other: 5,
        },
      });
    }
    return NextResponse.json({
      allocationTargets: JSON.parse(settings.allocationTargets),
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { allocationTargets } = body;

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { id: DEFAULT_USER_ID, name: "George" },
      });
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: DEFAULT_USER_ID },
      update: {
        allocationTargets: JSON.stringify(allocationTargets),
      },
      create: {
        userId: DEFAULT_USER_ID,
        allocationTargets: JSON.stringify(allocationTargets),
      },
    });

    return NextResponse.json({
      allocationTargets: JSON.parse(settings.allocationTargets),
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
