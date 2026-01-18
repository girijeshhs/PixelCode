export type LeetCodePublicStats = {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  fetchedAt: Date;
};

export class LeetCodeFetchError extends Error {
  status?: number;
  retryable?: boolean;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    options?: { status?: number; retryable?: boolean; retryAfterSeconds?: number }
  ) {
    super(message);
    this.name = "LeetCodeFetchError";
    this.status = options?.status;
    this.retryable = options?.retryable;
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }
}

const GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";
const DEFAULT_TIMEOUT_MS = 8000;

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

type LeetCodeClientOptions = {
  endpoint?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  userAgent?: string;
};

function parseRetryAfterSeconds(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);
  if (!Number.isNaN(seconds) && Number.isFinite(seconds)) {
    return Math.max(0, Math.floor(seconds));
  }

  const date = new Date(value);
  const diff = Math.ceil((date.getTime() - Date.now()) / 1000);
  return Number.isFinite(diff) ? Math.max(0, diff) : undefined;
}

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit,
  timeoutMs: number,
  fetchImpl: typeof fetch
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchImpl(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

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

export function createLeetCodeClient(options: LeetCodeClientOptions = {}) {
  const endpoint = options.endpoint ?? GRAPHQL_ENDPOINT;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  const userAgent =
    options.userAgent ?? "PixelCode/1.0 (+https://github.com/your-org/pixelcode)";

  async function fetchPublicStats(username: string): Promise<LeetCodePublicStats> {
    if (!username) {
      throw new LeetCodeFetchError("Missing LeetCode username");
    }

    let response: Response;
    try {
      response = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "user-agent": userAgent
          },
          body: JSON.stringify({
            query: PROFILE_QUERY,
            variables: { username }
          })
        },
        timeoutMs,
        fetchImpl
      );
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "LeetCode request timed out"
          : "Network error reaching LeetCode";

      throw new LeetCodeFetchError(message, { retryable: true });
    }

    if (!response.ok) {
      const retryAfterSeconds = parseRetryAfterSeconds(response.headers.get("retry-after"));
      const retryable = [429, 502, 503, 504].includes(response.status);
      const message =
        response.status === 429
          ? "Rate limited by LeetCode"
          : "Failed to reach LeetCode";

      throw new LeetCodeFetchError(message, {
        status: response.status,
        retryable,
        retryAfterSeconds
      });
    }

    const payload = (await response.json()) as LeetCodeGraphQLResponse;

    if (payload.errors?.length) {
      const message = payload.errors[0]?.message ?? "LeetCode returned errors";
      throw new LeetCodeFetchError(message, { status: response.status });
    }

    if (!payload.data?.matchedUser) {
      throw new LeetCodeFetchError("User not found", { status: 404, retryable: false });
    }

    return extractSolvedCounts(payload);
  }

  return { fetchPublicStats };
}

export async function fetchLeetCodePublicStats(username: string): Promise<LeetCodePublicStats> {
  const client = createLeetCodeClient();
  return client.fetchPublicStats(username);
}
