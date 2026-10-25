# Admin Kepegawaian (FE)

Angular 22 admin dashboard for the [`my-first-worker`](../my-first-worker) Cloudflare Worker API (Hono + D1 + Drizzle). UI copy is Bahasa Indonesia.

## Prerequisites

- The API running locally on `http://localhost:8787` (`npx wrangler dev` in the backend repo), with migrations applied and `npm run seed` executed.
- The seeded admin logs in with NIP `198001012000011001` and the same string as the password (override with `ADMIN_NIP` / `ADMIN_PASSWORD` when seeding).

## Development

```bash
npm install
npm start
```

Open `http://localhost:4200`. The API base URL lives in `src/environments/environment.ts` (`http://localhost:8787/api`); production builds swap in `environment.production.ts` (`https://api.rakawik.my.id/api`).

## Features

- **Auth**: NIP + password, HttpOnly cookie session, no public registration. Non-admin accounts land on an "Akses ditolak" page.
- **Pegawai**: server-side search (min 3 characters) and filters (role, status, bidang, pangkat/golongan, kategori jabatan, kebutuhan jam pelatihan), prev/next pagination, create/edit dialog, soft delete with confirmation.
- **Bidang** and **Pangkat & Golongan**: master-data CRUD with pagination.
- **Dashboard**: intentionally empty placeholder for now.

## Scripts

| Command                                          | Purpose                               |
| ------------------------------------------------ | ------------------------------------- |
| `npm start`                                      | Dev server on `http://localhost:4200` |
| `npm run build`                                  | Production build into `dist/`         |
| `npm test`                                       | Vitest unit tests                     |
| `npx prettier --check "src/**/*.{ts,html,scss}"` | Formatting check                      |

See `AGENTS.md` for conventions and the API contract.
