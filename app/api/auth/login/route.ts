import { NextResponse } from "next/server";
import {
  createSessionToken,
  isAuthConfigured,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifyLogin,
} from "../../../auth";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "ระบบเข้าสู่ระบบยังตั้งค่าไม่ครบ" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { username?: string; password?: string };
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!verifyLogin(username, password)) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(username), sessionCookieOptions);
  return response;
}
