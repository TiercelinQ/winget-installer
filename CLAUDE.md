# WinGet Hub

## Origin
Framework: electron v1.0.0

## Business context
Windows desktop application exposing a graphical interface for `winget`. The user can browse a curated software selection by category, search the winget catalog, select multiple packages, install them in one click with real-time log tracking, manage a favorites list, view installed packages and detect available updates.

## Design system migration
- 2026-07-16: converted from design system v1.x (Font Awesome 6, `--radius: 0`, generic Tailwind semantics, `--bg-muted` hover fill) to **v2.0** via `/electron-migrate-design`. Changes: accent-tinted neutrals derived from the `#006CBF` accent (both themes), semantics harmonized toward the accent hue (info = accent), `--radius: 5px`, `system-ui` font stack, `--ease-out` easing (160/240ms), border-strengthening hover, signature sliding underline on the topbar tabs, icons Font Awesome → **Lucide** (`lucide-react`). No behavior change (no IPC/model/controller/i18n edit). The user chose the accent-tinted neutral variant (the former Windows 11 neutral greys were replaced by the v2.0 tinted atmosphere).

## Framework deviations
- `--drawer-width`: 480px instead of 320px. Reason: density of winget metadata (long description, identifier, versions, publisher).
- `src/renderer/src/data/catalog.ts`: new curated data file (categories → winget ids). Reason: winget exposes neither a full catalog nor categories. Static renderer data, no IPC channel/model/controller added; install reuses `winget:install`.
- `favorites:export` / `favorites:import` channels: favorites JSON import/export via Electron's native `dialog`. Paths chosen by dialog (never from the renderer), imported JSON validated before writing, merge import without duplicates.
