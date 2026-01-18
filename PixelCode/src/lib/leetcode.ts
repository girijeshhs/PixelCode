export type LeetCodePublicStats = {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  fetchedAt: Date;
};

export class LeetCodeFetchError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "LeetCodeFetchError";
    this.status = status;
  }
}

const GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

const PROFILE_QUERY = `
  query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

type LeetCodeGraphQLResponse = {
  data?: {
    matchedUser?: {
      username?: string | null;
      submitStatsGlobal?: {
        acSubmissionNum?: Array<{ difficulty?: string | null; count?: number | null }>;
      } | null;
    } | null;
  };
  errors?: Array<{ message?: string }>;
};

function extractSolvedCounts(payload: LeetCodeGraphQLResponse): LeetCodePublicStats {
  const stats = payload.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum ?? [];
  const counts = new Map<string, number>();

  for (const stat of stats) {
    const key = stat.difficulty ?? "Unknown";
    counts.set(key, stat.count ?? 0);
  }

  const totalSolved = counts.get("All") ?? 0;
  const easySolved = counts.get("Easy") ?? 0;
  const mediumSolved = counts.get("Medium") ?? 0;
  const hardSolved = counts.get("Hard") ?? 0;

  return {
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    fetchedAt: new Date()
  };
}

export async function fetchLeetCodePublicStats(username: string): Promise<LeetCodePublicStats> {
  if (!username) {
    throw new LeetCodeFetchError("Missing LeetCode username");
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "PixelCode/1.0 (+https://github.com/your-org/pixelcode)"
    },
    body: JSON.stringify({
      query: PROFILE_QUERY,
      variables: { username }
    })
  });

  if (!response.ok) {
    throw new LeetCodeFetchError("Failed to reach LeetCode", response.status);
  }

  const payload = (await response.json()) as LeetCodeGraphQLResponse;

  if (payload.errors?.length) {
    const message = payload.errors[0]?.message ?? "LeetCode returned errors";
    throw new LeetCodeFetchError(message, response.status);
  }

  if (!payload.data?.matchedUser) {
    throw new LeetCodeFetchError("User not found", 404);
  }

  return extractSolvedCounts(payload);
}
