import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200)
});

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      displayName: true,
      leetcodeUsername: true,
      createdAt: true,
      passwordHash: true
    }
  });

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(user.id);
  const cookieOptions = getSessionCookieOptions();

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      leetcodeUsername: user.leetcodeUsername,
      createdAt: user.createdAt
    }
  });

  response.cookies.set({
    name: cookieOptions.name,
    value: token,
    httpOnly: cookieOptions.httpOnly,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    secure: cookieOptions.secure,
    maxAge: cookieOptions.maxAge
  });

  return response;
}
