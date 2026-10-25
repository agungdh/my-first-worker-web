You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project Context

- This project is an **admin dashboard** application.
- Build UI with **Angular Material** (`@angular/material`) and the Angular CDK (`@angular/cdk`).
- The Material 3 theme lives in `src/material-theme.scss` (uses `mat.theme()` with the azure/blue palettes and Roboto typography). Extend the theme there instead of hardcoding colors.
- Use Material system variables (e.g. `var(--mat-sys-surface)`, `var(--mat-sys-on-surface)`) for custom styling so light/dark theming keeps working.
- Layout patterns expected in an admin dashboard: navigation shell (`mat-sidenav` + `mat-toolbar`), data tables (`mat-table` with sorting/pagination), filters, dialogs, snackbars, and dashboard summary cards.
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
- For data-heavy admin screens, prefer `mat-table` with `MatSort` and `MatPaginator`, and move filtering/sorting logic into the component with `computed()` where possible.
- Use `MatDialog` for create/edit flows instead of navigating away, and `MatSnackBar` for action feedback.
- Ensure every Material form control has a label (`mat-label` or `aria-label`) and proper error messaging via `mat-error`.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
