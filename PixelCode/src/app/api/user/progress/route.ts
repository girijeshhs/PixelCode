import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await verifySessionToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(60, Math.max(7, Number(searchParams.get("days") ?? 14)));

  const [progress, latestSnapshot] = await Promise.all([
    prisma.dailyProgress.findMany({
      where: { userId },
      orderBy: { progressDate: "desc" },
      take: days,
      select: {
        progressDate: true,
        deltaEasy: true,
        deltaMedium: true,
        deltaHard: true,
        deltaTotal: true,
        xpEarned: true,
        streakAfter: true
      }
    }),
    prisma.leetCodeSnapshot.findFirst({
      where: { userId },
      orderBy: { snapshotDate: "desc" },
      select: {
        snapshotDate: true,
        totalSolved: true,
        easySolved: true,
        mediumSolved: true,
        hardSolved: true
      }
    })
  ]);

  return NextResponse.json({
    days,
    progress: progress.reverse(),
    latestSnapshot
  });
}
