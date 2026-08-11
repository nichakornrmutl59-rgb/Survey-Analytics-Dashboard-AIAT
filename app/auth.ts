import { createHmac, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE_NAME = "aiat_dashboard_session";
export const SESSION_MAX_AGE = 60 * 60 * 8;

function secret() {
  return process.env.AUTH_SECRET?.trim() ?? "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isAuthConfigured() {
  return Boolean(
    process.env.DASHBOARD_USERNAME?.trim() &&
      process.env.DASHBOARD_PASSWORD_HASH?.trim() &&
      secret().length >= 32,
  );
}

export function verifyLogin(username: string, password: string) {
  const expectedUsername = process.env.DASHBOARD_USERNAME?.trim() ?? "";
  const encodedHash = process.env.DASHBOARD_PASSWORD_HASH?.trim() ?? "";
  const [scheme, iterationText, salt, expectedHash] = encodedHash.split("$");
  const iterations = Number(iterationText);

  if (
    !isAuthConfigured() ||
    !safeEqual(username, expectedUsername) ||
    scheme !== "pbkdf2-sha256" ||
    !Number.isSafeInteger(iterations) ||
    iterations < 100_000 ||
    !salt ||
    !expectedHash
  ) {
    return false;
  }

  const actualHash = pbkdf2Sync(password, Buffer.from(salt, "base64url"), iterations, 32, "sha256").toString("base64url");
  return safeEqual(actualHash, expectedHash);
}

export function createSessionToken(username: string) {
  const payload = Buffer.from(
    JSON.stringify({ username, expiresAt: Date.now() + SESSION_MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string) {
  if (!isAuthConfigured()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username?: string;
      expiresAt?: number;
    };
    return (
      decoded.username === process.env.DASHBOARD_USERNAME?.trim() &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export async function isDashboardAuthenticated() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? "";
  return verifySessionToken(token);
}

export async function requireDashboardAuthentication() {
  if (!(await isDashboardAuthenticated())) redirect("/login");
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
