import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const cookieOptions = getSessionCookieOptions();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: cookieOptions.name,
    value: "",
    httpOnly: cookieOptions.httpOnly,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    secure: cookieOptions.secure,
    maxAge: 0
  });
  return response;
}
