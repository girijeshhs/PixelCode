import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordDailySnapshot } from "@/lib/snapshots";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { leetcodeUsername: { not: null } },
    select: { id: true, leetcodeUsername: true }
  });

  const results: Array<{ userId: string; status: string; reason?: string }> = [];

  for (const user of users) {
    if (!user.leetcodeUsername) {
      continue;
    }

    let result = await recordDailySnapshot(user.id, user.leetcodeUsername);

    if (result.status === "failed" && result.retryable) {
      const retryDelayMs = Math.min(3000, (result.retryAfterSeconds ?? 1) * 1000);
      await sleep(retryDelayMs);
      result = await recordDailySnapshot(user.id, user.leetcodeUsername);
    }

    results.push({ userId: user.id, ...result });

    // Gentle pacing to reduce risk of rate limiting.
    await sleep(200);
  }

  return NextResponse.json({
    processed: results.length,
    results
  });
}
