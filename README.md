# WinGet Hub

Windows desktop application to select software from the winget catalog and install it in one click.

## Goal

Graphical interface for `winget`: category browsing (curated selection), catalog search, single or batch installation, favorites management, tracking of available updates and installed packages.

## Stack

| Item         | Value                                                             |
| ------------ | ----------------------------------------------------------------- |
| Runtime      | Node.js 22 LTS · Electron ≥ 42                                    |
| Language     | TypeScript strict                                                 |
| Renderer     | React 19 (functional components + hooks)                          |
| Build        | electron-vite + Vite 7                                            |
| Architecture | Strict MVC - main = Models · renderer = Views · IPC = Controllers |
| Style        | Centralized CSS (tokens.css + styles.css)                         |
| Icons        | Lucide (`lucide-react`)                                          |
| Packaging    | electron-builder (NSIS + portable)                                |
| DB           | None (flat JSON file via Node.js stdlib)                          |
| i18n         | No - FR strings centralized in `i18n/fr.json`                     |
| Tests        | No                                                                |
| Design       | design-system.md v2.0 · layout.md v4.1                            |

## File tree

```
winget-installer/
├── src/
│   ├── shared/
│   │   ├── config.ts               application constants
│   │   ├── types.ts                DTOs + WindowApi interface
│   │   └── ipc-channels.ts         IPC channel constants
│   ├── main/
│   │   ├── index.ts                entry point, BrowserWindow, security
│   │   ├── models/
│   │   │   ├── errors.ts           WingetError, FavoritesError, PreferencesError
│   │   │   ├── winget.model.ts     spawn winget (search, install, list, upgrades)
│   │   │   ├── favorites.model.ts  read/write favorites.json
│   │   │   └── preferences.model.ts read/write preferences.json
│   │   └── controllers/
│   │       ├── index.ts            registerAllControllers()
│   │       ├── winget.controller.ts
│   │       ├── favorites.controller.ts
│   │       └── preferences.controller.ts
│   ├── preload/
│   │   └── index.ts                contextBridge — window.api
│   └── renderer/src/
│       ├── App.tsx                 main shell
│       ├── views/
│       │   ├── layout/             Topbar, Statusbar, Drawer, Modal
│       │   ├── ToastManager.tsx
│       │   ├── CatalogView.tsx
│       │   ├── InstalledView.tsx
│       │   ├── UpdatesView.tsx
│       │   ├── FavoritesView.tsx
│       │   └── SettingsView.tsx
│       ├── hooks/                  useTheme, useToast, useInstall
│       ├── data/catalog.ts         curated catalog (categories → winget packages)
│       ├── utils/helpers.ts
│       ├── i18n/fr.json
│       └── styles/                 tokens.css + styles.css
├── resources/icon.ico
├── scripts/ensure-electron.cjs
└── docs/specs/                     generation specs (phases 1-4)
```

## IPC channels

| Channel                 | Type               | Description                                |
| ----------------------- | ------------------ | ------------------------------------------ |
| `winget:search`         | invoke             | Search the catalog                         |
| `winget:install`        | invoke             | Install a list of packages                 |
| `winget:install:cancel` | invoke             | Cancel the running installation            |
| `install:log`           | push main→renderer | Real-time log line                         |
| `winget:list`           | invoke             | List installed packages                    |
| `winget:upgrades`       | invoke             | List available updates                     |
| `winget:upgrade-one`    | invoke             | Update a package                           |
| `favorites:list`        | invoke             | Get favorites                              |
| `favorites:add`         | invoke             | Add a favorite                             |
| `favorites:remove`      | invoke             | Remove a favorite                          |
| `favorites:export`      | invoke             | Export favorites to JSON (dialog)          |
| `favorites:import`      | invoke             | Import favorites from JSON (dialog, merge) |
| `pref:get`              | invoke             | Read preferences                           |
| `pref:set`              | invoke             | Write a preference                         |

## Conventions

- **No hardcoded visual values in TS/TSX**: everything in `tokens.css` / `styles.css`.
- **Dark theme**: `data-theme="dark"` on `<html>`, tokens redefined in a single `[data-theme="dark"]` block.
- **Errors**: the model throws typed errors → the controller returns `IpcResult<T>` → the view shows a toast.
- **Drawer**: 480px (declared deviation vs 320px in layout.md), justified by the density of winget metadata.
- **Icon**: `resources/icon.ico` (multi-size 16→256) + topbar PNG logo (`assets/icon.png`).
- **Catalog**: `data/catalog.ts` holds a curated selection (categories → verified winget ids). Since winget exposes neither a full catalog nor categories, this static list feeds category browsing; installation reuses the `winget:install` channel.

## Install and run

```bash
npm install
npm run dev          # development mode
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run build        # build without packaging
npm run dist         # Windows packaging (.exe installer + portable)
```

> **Security**: run `npm audit` before each release.
> **Stop hook**: `.claude/settings.json` triggers `npm run lint` at the end of each Claude Code session; you can remove or adjust it in `.claude/settings.json`.
