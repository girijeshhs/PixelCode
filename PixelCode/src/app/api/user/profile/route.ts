import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

const updateSchema = z.object({
  displayName: z.string().min(2).max(40).optional(),
  leetcodeUsername: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional()
});

async function getUserIdFromRequest(request: NextRequest) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      leetcodeUsername: true,
      createdAt: true,
      totalXp: true,
      level: true,
      streak: true,
      streakFreezeTokens: true,
      lastSnapshotAt: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: parsed.data.displayName,
        leetcodeUsername: parsed.data.leetcodeUsername ?? undefined
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        leetcodeUsername: true,
        createdAt: true,
        totalXp: true,
        level: true,
        streak: true,
        streakFreezeTokens: true,
        lastSnapshotAt: true
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "LeetCode username already in use"
        : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
