# GovWatch Mobile

GovWatch is a mobile oversight workspace for Ministry inspectors to monitor care institutions, review CCTV and AI alerts, and complete field inspections.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/govwatch-mobile run dev` — run the Expo mobile preview
- `pnpm --filter @workspace/govwatch-mobile run typecheck` — typecheck the mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/govwatch-mobile/app/index.tsx` — Expo Router entry and mobile screen flow
- `artifacts/govwatch-mobile/src/components/GovWatchUI.tsx` — reusable mobile UI primitives
- `artifacts/govwatch-mobile/src/context/GovWatchContext.tsx` — local auth, inspection, evidence, and assignment state
- `artifacts/govwatch-mobile/src/data/mock.ts` — demo institutions, alerts, CCTV feeds, officers, and inspection content
- `artifacts/govwatch-mobile/src/theme/` — ivory + teal design tokens
- `artifacts/govwatch-mobile/assets/images/` — generated app icon and institutional reference imagery

## Architecture decisions

- The first release is frontend-only and uses local mock services/state so a real API can replace the data layer later.
- AsyncStorage keeps demo sign-in state; the field-inspection flow keeps checklist and evidence state in a shared React context.
- Device location and image selection are requested where available, with explicit mock fallback behavior for Expo web and denied permissions.
- The custom bottom navigation mirrors the supplied mobile designs instead of using the scaffold's default tab chrome.

## Product

- Official demo sign-in with role selection, password visibility, persistent sign-in, recovery modal, and validation feedback.
- Dashboard with searchable mock activity, filters, AI alert previews, weekly progress, and recent inspections.
- Live CCTV grid and detail view, AI anomaly alerts and detail/response flow, video verification, and simulated call screen.
- Four-step GPS, checklist, evidence, and report submission workflow with native location/image-picker fallbacks.
- Institute directory and district assignment flow with officer selection and confirmation feedback.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
