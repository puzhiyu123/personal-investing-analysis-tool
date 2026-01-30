import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const PUBLIC_ROUTES = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/health",
];

const STATIC_PATTERNS = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  for (const pattern of STATIC_PATTERNS) {
    if (pathname.startsWith(pattern)) {
      return true;
    }
  }
  return false;
}

async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [expiryStr, providedSignature] = token.split(".");
    if (!expiryStr || !providedSignature) {
      return false;
    }
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) {
      return false;
    }
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return false;
    }
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(expiryStr)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return providedSignature === expectedSignature;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken || !(await verifySessionToken(sessionToken))) {
    if (!pathname.startsWith("/api/")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
