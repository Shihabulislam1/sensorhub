# AGENTS.md — the one rulebook

Every coding agent in this repo reads this file: Codex, OpenCode and Antigravity (`agy`) read it
directly, and Claude Code imports it from `CLAUDE.md`. Tool-specific files only add permissions,
hooks and skills on top. If a rule here conflicts with a tool's default, this file wins.

## What this project is

SensorHub is a small IoT telemetry platform: simulated embedded devices post readings, a NestJS
API stores them in PostgreSQL and streams them live, and a Next.js dashboard shows them.

| Path              | Owns                                                           | Stack                             |
| ----------------- | -------------------------------------------------------------- | --------------------------------- |
| `apps/api`        | REST + server-sent events under `/api/*`                       | NestJS 11, TypeORM, PostgreSQL 16 |
| `apps/web`        | Dashboard UI; proxies `/api/*` to the API                      | Next.js 16 App Router, React 19   |
| `apps/simulator`  | Fake devices that POST to `/api/readings`                      | Node + TypeScript                 |
| `packages/shared` | Types shared by all three (`Device`, `Reading`, `StreamEvent`) | TypeScript, types only            |

Data flow: `simulator → POST /api/readings → ReadingsService → Postgres` and
`ReadingsService → StreamService → GET /api/stream (SSE) → dashboard`.

## Commands

Run from the repo root unless noted.

| Task                  | Command                                                                              |
| --------------------- | ------------------------------------------------------------------------------------ |
| Install               | `pnpm install` (also builds `packages/shared`)                                       |
| Build everything      | `pnpm build`                                                                         |
| Test everything       | `pnpm test`                                                                          |
| Test one app          | `pnpm --filter api test` (or `web`, `simulator`)                                     |
| Lint                  | `pnpm lint` (`pnpm lint:fix` to auto-fix)                                            |
| Run the whole stack   | `docker compose up -d --build`                                                       |
| Start a feature stack | `scripts/feature.sh <name> <slot>` / `scripts\feature.ps1 -Name <name> -Slot <slot>` |
| Logs                  | `docker compose logs -f api`                                                         |

## Conventions

**API (NestJS)**

- One folder per feature module: `src/<feature>/` with `<feature>.module.ts`, `.controller.ts`,
  `.service.ts`, `<thing>.entity.ts`, `dto/`, and a `<feature>.service.spec.ts`.
- Validate every request body and query with a DTO class using `class-validator`. Never accept `any`.
- Controllers stay thin: parse input, call the service, return. Logic lives in services.
- Register new modules in `src/app.module.ts`. Entities are picked up by `autoLoadEntities`.
- Schema changes: edit the entity. In dev, TypeORM `synchronize` updates the table.
- To push something to the dashboard live, call `StreamService.publish()` with a `StreamEvent`,
  and add the new event shape to `packages/shared/src/index.ts`.
- All routes are under the global `/api` prefix. Don't add `api/` to controller paths.

**Dashboard (Next.js)**

- Pages are Server Components by default and fetch with `apiGet()` from `lib/api.ts`.
- Anything with state, effects or the live stream is a Client Component (`'use client'`) in
  `components/`, and calls `/api/...` relatively (the rewrite proxies it).
- Live data: use the `useStream()` hook from `lib/use-stream.ts`. Don't open your own EventSource.
- Styling: plain CSS in `app/globals.css` using the existing variables. No UI libraries.
- Pure helpers go in `lib/` with a `*.test.ts` next to them (Vitest).

**Shared types**

- `packages/shared` holds types only. Import them with `import type`.
- If you change a shared type, update every app that uses it in the same change.

**General**

- TypeScript strict everywhere. No `any`, no `@ts-ignore`.
- Small, focused changes. Don't reformat files you didn't otherwise touch.
- Keep seed and demo data fake. This app can be public on the internet via Tailscale Funnel.
- Every new environment variable must be documented in `.env.example` with a safe local default and
  read with a fallback in code. Never require a secret for local development, and never read the
  real `.env` (hard rule 1).

## Hard rules (never break these)

1. **Never read, print or edit `.env` or `.env.*` files** (`.env.example` is fine). The `.env` in a
   worktree only holds ports, but the rule stays strict so it's a habit.
2. **Never `git push`**, and never commit to `main`. Work on your feature branch in your worktree.
3. **Never run destructive commands**: no `rm -rf`, `DROP DATABASE`, `docker system prune`,
   `git reset --hard`, or anything with `--force`.
4. **Never expose the database or API publicly.** Only the dashboard (port 3000) is ever funnelled.
5. **Run the tests before saying you're done.** If they fail, say so. Don't hide it.
6. Don't add new dependencies without saying why in your summary.

## Definition of done

- `pnpm test` passes for every app you touched, and `pnpm lint` is clean.
- `pnpm build` succeeds for the apps you touched.
- New behaviour has at least one test.
- Finish with a short summary: what changed, which files, how you tested it, anything left undone.

## Parallel work (worktrees)

Each feature runs in its own git worktree with its own Docker stack:

| Slot | Folder         | Branch        | Web    | API    | Postgres |
| ---- | -------------- | ------------- | ------ | ------ | -------- |
| 0    | `sensorhub/`   | `main`        | 3000   | 4000   | 5432     |
| 1    | `../sh-<name>` | `feat/<name>` | 3001   | 4001   | 5433     |
| 2    | `../sh-<name>` | `feat/<name>` | 3002   | 4002   | 5434     |
| N    | `../sh-<name>` | `feat/<name>` | 3000+N | 4000+N | 5432+N   |

If you were started inside a worktree, stay inside it. Don't edit files in other worktrees.
