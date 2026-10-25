You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project Context

- This project is the **Admin Kepegawaian** dashboard for the `my-first-worker` API.
- UI copy is **Bahasa Indonesia**. Code, identifiers, and comments stay in English.
- Backend domains: `pegawai`, `bidang`, `pangkat-golongan`, plus cookie-based auth. There is no register, tasks, images, or validation playground.
- Build UI with **Angular Material** (`@angular/material`) and the Angular CDK (`@angular/cdk`).
- The Material 3 theme lives in `src/styles.scss` (uses `mat.theme()` with the azure/blue palettes and Roboto typography). Extend the theme there instead of hardcoding colors.
- Use Material system variables (e.g. `var(--mat-sys-surface)`, `var(--mat-sys-on-surface)`) for custom styling so light/dark theming keeps working.
- Layout patterns: navigation shell (`mat-sidenav` + `mat-toolbar`), data tables (`mat-table`) with server-side filters, keyset pagination via infinite scroll, and sortable columns, dialogs for create/edit, snackbars for feedback.
- Icons use Material Symbols Outlined; declare them with `<mat-icon>icon_name</mat-icon>`.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Angular Material

- Import only the specific Material components/directives each component needs; do not import a barrel of everything.
- Prefer Material components over hand-rolled UI for tables, forms, dialogs, menus, tabs, and navigation.
- Follow the Material 3 design spec; keep spacing, density, and typography consistent with the theme.
- List endpoints use keyset pagination and return no total. `id` is the only pagination anchor and the only cursor param. The FE always sends `sort` + `order` explicitly, so the API default (`sort=id`, `order=desc`, newest first) only applies to a request that sends no params at all — do not rely on it or drop the explicit sort to "use the default". Request the first page without `id`, then echo `next_id` back as `id` and stop when `has_more` is false. There is no `cursor`, `cursor_value`, `limit`, or `page` param. Append pages with infinite scroll (`InfiniteScrollDirective` + `IntersectionObserver`), never with a "full page means there may be a next page" heuristic. Do not add `MatPaginator`.
- Sorting is server-side: use `MatSort` with `matSortDisableClear` and map `active`/`direction` to the API's per-module `sort` enum and `order`. Only expose columns the API supports (pegawai `nama`/`nip`, bidang `bidang`, pangkat-golongan `jenjang`/`pangkat`/`golongan`/`ruang`). A sort change resets the list.
- Use native `<select matNativeControl>` for select fields inside Signal Forms; `mat-select` does not implement `FormValueControl` in the installed Material version.
- Use `MatDialog` for create/edit flows instead of navigating away, and `MatSnackBar` for action feedback.
- Ensure every Material form control has a label (`mat-label` or `aria-label`) and proper error messaging via `mat-error`.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Backend API

Base URL comes from `src/environments/environment*.ts` (`http://localhost:8787/api` locally, `https://api.rakawik.my.id/api` in production). The backend lives in `/home/agungdh/repo/my-first-worker`.

| Endpoint                                | Notes                                                                                                                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/login`                      | `{ nip, password }` → `{ success, user }` with the full pegawai (relations included) and sets an HttpOnly `access_token` cookie                                                                |
| `POST /auth/logout`                     | Clears the cookie                                                                                                                                                                              |
| `GET/POST/PUT/DELETE /pegawai`          | List: `id` (cursor), `sort` (`id`/`nama`/`nip`), `order`, `search` (min 3 chars), `role`, `status`, `bidang_id`, `pangkat_golongan_id`, `kategori_jabatan`, `kategori_kebutuhan_jam_pelatihan` |
| `GET/POST/PUT/DELETE /bidang`           | List: `id` (cursor), `sort` (`id`/`bidang`), `order`                                                                                                                                           |
| `GET/POST/PUT/DELETE /pangkat-golongan` | List: `id` (cursor), `sort` (`id`/`jenjang`/`pangkat`/`golongan`/`ruang`), `order`                                                                                                             |

Every list response carries `next_id` (the `id` to echo back for the next page, or `null`) and `has_more` alongside its items.

Rules:

- Auth is a cookie, not a bearer token: every request needs `withCredentials: true` (the interceptor adds it). The JWT only carries the pegawai id (`sub`); the backend resolves the principal from the database on every request. There is **no `/me`** endpoint: `SessionStore` caches the full pegawai returned by login in localStorage (key `mfw.admin.session.v3`) so the shell renders without another fetch. A 401 clears the session and redirects to `/login`; a 403 redirects to `/akses-ditolak` (the cached role can be stale).
- Pagination is forward-only keyset on `(sort_column, id)`: the backend resolves the sort value of the `id` row itself, so never send a sort value alongside the cursor. Echo `next_id` as `id` to append the next page and stop when `has_more` is `false`. Keep the same `sort`/`order` for every page of one list, and reset the list (drop `id`) when the sort or a filter changes. A cursor pointing at a row that no longer exists returns an empty page with `has_more: false`, so treat that as the end of the list, not an error.
- All data endpoints are admin-only. Non-admin accounts can log in but are routed to `/akses-ditolak`.
- Request/response payloads are snake_case (`bidang_id`, `pangkat_golongan_id`, `kategori_jabatan`, `kategori_kebutuhan_jam_pelatihan`), while TypeScript models keep the API names because they mirror the wire format.
- Create/update/delete return only `{ success: true }` (no entity), so reload the list after saving. Updates are full `PUT`: send every field, with `null` for empty nullable fields.
- On create, an empty password means "use the NIP". On update, an empty password means "keep the current one" — omit the key instead of sending an empty string.
- Request bodies are strict: never add extra keys. Normalize empty text to `null` (`buildPegawaiInput` in the pegawai dialog does this).
- Errors use `{ success: false, errors: [{ code, message, path? }] }`; show them with `apiErrorMessage()` from `src/app/core/http/api-error.ts`.
- Field limits must match the backend Zod schemas (NIP 8-20 digits, nama 150, password 8-128, bidang 255, jenjang 100, pangkat 150, golongan 20, ruang 20).
