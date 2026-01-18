# PixelCode

Gamified LeetCode progress tracking with a pixel-art inspired UI.

## Setup

1. Install Node.js 18+ and npm.
2. Copy `.env.example` to `.env` and fill in values.
3. Install dependencies: `npm install`
4. Generate Prisma client: `npm run prisma:generate`
5. Run migrations: `npm run prisma:migrate`
6. Start dev server: `npm run dev`

## Key Notes

- LeetCode has no official public API. We only use the public GraphQL endpoint and only for public profile stats.
- Daily solved counts are derived by comparing snapshots stored in `LeetCodeSnapshot`.
- Snapshot cron lives at `POST /api/cron/daily-snapshot` and requires the `x-cron-secret` header.
- Auth is implemented with email + password and a signed session cookie (`AUTH_SECRET`).
- User dashboards pull from `/api/user/profile` and `/api/user/progress`.

## TODO

- Add OAuth providers (GitHub optional) if needed.
- Add cron infrastructure (Vercel cron / GitHub Actions / external scheduler).
- Add error monitoring and rate-limit backoff strategy.
