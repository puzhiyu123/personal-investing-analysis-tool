import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAppPassword,
  createSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!verifyAppPassword(password)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const sessionToken = createSession();

    const useSecureCookies = process.env.HTTPS === "true";
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
