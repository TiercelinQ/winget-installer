# WinGet Hub

## Origin
Framework: electron v1.0.0

## Business context
Windows desktop application exposing a graphical interface for `winget`. The user can browse a curated software selection by category, search the winget catalog, select multiple packages, install them in one click with real-time log tracking, manage a favorites list, view installed packages and detect available updates.

## Framework deviations
- `--drawer-width`: 480px instead of 320px. Reason: density of winget metadata (long description, identifier, versions, publisher).
- `src/renderer/src/data/catalog.ts`: new curated data file (categories → winget ids). Reason: winget exposes neither a full catalog nor categories. Static renderer data, no IPC channel/model/controller added; install reuses `winget:install`.
- `favorites:export` / `favorites:import` channels: favorites JSON import/export via Electron's native `dialog`. Paths chosen by dialog (never from the renderer), imported JSON validated before writing, merge import without duplicates.
