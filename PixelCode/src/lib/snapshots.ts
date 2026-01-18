import { prisma } from "@/lib/prisma";
import { fetchLeetCodePublicStats, LeetCodeFetchError } from "@/lib/leetcode";
import { calculateDailyProgress } from "@/lib/gamification";

function toDateOnlyUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function recordDailySnapshot(userId: string, leetcodeUsername: string) {
  const snapshotDate = toDateOnlyUTC(new Date());

  const existing = await prisma.leetCodeSnapshot.findUnique({
    where: {
      userId_snapshotDate: {
        userId,
        snapshotDate
      }
    }
  });

  if (existing) {
    return { status: "skipped" as const, reason: "already-snapshotted" };
  }

  let stats;
  try {
    stats = await fetchLeetCodePublicStats(leetcodeUsername);
  } catch (error) {
    const message =
      error instanceof LeetCodeFetchError ? error.message : "Unknown fetch error";
    return { status: "failed" as const, reason: message };
  }

  const previousSnapshot = await prisma.leetCodeSnapshot.findFirst({
    where: { userId },
    orderBy: { snapshotDate: "desc" }
  });

  await prisma.$transaction(async (tx) => {
    await tx.leetCodeSnapshot.create({
      data: {
        userId,
        totalSolved: stats.totalSolved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        snapshotDate,
        fetchedAt: stats.fetchedAt
      }
    });

    if (previousSnapshot) {
      const user = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return;
      }

      const gamified = calculateDailyProgress({
        previous: previousSnapshot,
        current: stats,
        previousStreak: user.streak,
        previousTotalXp: user.totalXp,
        freezeTokens: user.streakFreezeTokens
      });

      await tx.dailyProgress.create({
        data: {
          userId,
          progressDate: snapshotDate,
          deltaEasy: gamified.deltaEasy,
          deltaMedium: gamified.deltaMedium,
          deltaHard: gamified.deltaHard,
          deltaTotal: gamified.deltaTotal,
          xpEarned: gamified.xpEarned,
          streakAfter: gamified.newStreak
        }
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          totalXp: gamified.newTotalXp,
          level: gamified.newLevel,
          streak: gamified.newStreak,
          streakFreezeTokens: gamified.usedFreeze
            ? Math.max(0, user.streakFreezeTokens - 1)
            : user.streakFreezeTokens,
          lastSnapshotAt: new Date()
        }
      });
    }
  });

  return { status: "ok" as const };
}
