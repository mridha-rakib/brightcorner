# Bright Corner API

## Quick start

```bash
pnpm install
cp .env.sample .env
pnpm dev
```

## Scripts

- `pnpm dev`: run API in watch mode.
- `pnpm build`: compile TypeScript to `dist/`.
- `pnpm start`: run compiled API with environment file.
- `pnpm typecheck`: run strict TypeScript checks.
- `pnpm lint`: run ESLint.
- `pnpm lint:fix`: auto-fix lint issues.
- `pnpm test`: run Vitest tests.

## Architecture

- Centralized runtime config in `src/env.ts` using Zod v4 validation.
- Request logging in `src/middlewares/pino-logger.ts`.
- Global error contract in `src/middlewares/error-handler.middleware.ts`.
- Health/base API routes in `src/routes/index.route.ts`.