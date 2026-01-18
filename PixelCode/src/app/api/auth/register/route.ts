import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  displayName: z.string().min(2).max(40),
  leetcodeUsername: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional()
});

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password, displayName, leetcodeUsername } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, ...(leetcodeUsername ? [{ leetcodeUsername }] : [])]
    },
    select: { id: true }
  });

  if (existing) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      leetcodeUsername: leetcodeUsername ?? null
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      leetcodeUsername: true,
      createdAt: true
    }
  });

  const token = await createSessionToken(user.id);
  const cookieOptions = getSessionCookieOptions();

  const response = NextResponse.json({ user });
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
