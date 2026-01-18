export type SnapshotCounts = {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
};

export type DailyDelta = {
  deltaEasy: number;
  deltaMedium: number;
  deltaHard: number;
  deltaTotal: number;
};

export type GamificationResult = DailyDelta & {
  xpEarned: number;
  newStreak: number;
  usedFreeze: boolean;
  newTotalXp: number;
  newLevel: number;
};

const XP_VALUES = {
  Easy: 10,
  Medium: 25,
  Hard: 50
} as const;

export function deriveDailyDelta(previous: SnapshotCounts, current: SnapshotCounts): DailyDelta {
  const deltaEasy = Math.max(0, current.easySolved - previous.easySolved);
  const deltaMedium = Math.max(0, current.mediumSolved - previous.mediumSolved);
  const deltaHard = Math.max(0, current.hardSolved - previous.hardSolved);
  const deltaTotal = Math.max(0, current.totalSolved - previous.totalSolved);

  return { deltaEasy, deltaMedium, deltaHard, deltaTotal };
}

export function calculateDailyProgress(params: {
  previous: SnapshotCounts;
  current: SnapshotCounts;
  previousStreak: number;
  previousTotalXp: number;
  freezeTokens?: number;
}): GamificationResult {
  const { previous, current, previousStreak, previousTotalXp, freezeTokens = 0 } = params;
  const delta = deriveDailyDelta(previous, current);

  const xpEarned =
    delta.deltaEasy * XP_VALUES.Easy +
    delta.deltaMedium * XP_VALUES.Medium +
    delta.deltaHard * XP_VALUES.Hard;

  let newStreak = previousStreak;
  let usedFreeze = false;

  if (delta.deltaTotal > 0) {
    newStreak = previousStreak + 1;
  } else if (freezeTokens > 0) {
    usedFreeze = true;
  } else {
    newStreak = 0;
  }

  const newTotalXp = previousTotalXp + xpEarned;
  const newLevel = Math.floor(Math.sqrt(newTotalXp));

  return {
    ...delta,
    xpEarned,
    newStreak,
    usedFreeze,
    newTotalXp,
    newLevel
  };
}
