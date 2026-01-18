import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordDailySnapshot } from "@/lib/snapshots";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    userId?: string;
  } | null;

  if (!body?.userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // TODO: Replace with authenticated user context and remove userId from body.
  const user = await prisma.user.findUnique({
    where: { id: body.userId },
    select: { leetcodeUsername: true }
  });

  if (!user?.leetcodeUsername) {
    return NextResponse.json({ error: "LeetCode username not set" }, { status: 400 });
  }

  const result = await recordDailySnapshot(body.userId, user.leetcodeUsername);

  return NextResponse.json(result);
}
