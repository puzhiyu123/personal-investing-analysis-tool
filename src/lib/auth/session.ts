import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "invest_session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return secret;
}

function getPasswordHash(): string {
  const hash = process.env.AUTH_PASSWORD_HASH;
  if (!hash) {
    throw new Error("AUTH_PASSWORD_HASH environment variable is not set");
  }
  return hash;
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyAppPassword(password: string): boolean {
  const storedHash = getPasswordHash();
  const inputHash = hashPassword(password);
  return crypto.timingSafeEqual(
    Buffer.from(storedHash),
    Buffer.from(inputHash)
  );
}

export function createSession(): string {
  const expiry = Date.now() + SESSION_DURATION_MS;
  const secret = getAuthSecret();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(expiry.toString())
    .digest("hex");
  return `${expiry}.${signature}`;
}

export function verifySession(token: string): boolean {
  try {
    const [expiryStr, providedSignature] = token.split(".");
    if (!expiryStr || !providedSignature) {
      return false;
    }
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) {
      return false;
    }
    const secret = getAuthSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(expiryStr)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionToken();
  if (!token) {
    return false;
  }
  return verifySession(token);
}
