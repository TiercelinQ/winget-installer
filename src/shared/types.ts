export interface PackageInfo {
  id: string;
  name: string;
  version: string;
  publisher: string;
  source: string;
}

export interface InstalledPackage {
  id: string;
  name: string;
  installedVersion: string;
  availableVersion: string | null;
}

export interface UpgradeInfo {
  id: string;
  name: string;
  installedVersion: string;
  availableVersion: string;
}

export interface Favorite {
  id: string;
  name: string;
  publisher: string;
  version: string;
  addedAt: string;
}

export interface Preferences {
  theme: "light" | "dark" | "system";
  startupTab: "catalog" | "installed" | "updates" | "favorites";
}

export type ToastType = "success" | "info" | "warning" | "danger";

export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { type: ToastType; message: string; description?: string } };

export interface WindowApi {
  searchPackages: (query: string) => Promise<IpcResult<PackageInfo[]>>;
  installPackages: (ids: string[]) => Promise<IpcResult<void>>;
  cancelInstall: () => Promise<IpcResult<void>>;
  onInstallLog: (cb: (line: string) => void) => () => void;
  listInstalled: () => Promise<IpcResult<InstalledPackage[]>>;
  listUpgrades: () => Promise<IpcResult<UpgradeInfo[]>>;
  upgradePackage: (id: string) => Promise<IpcResult<void>>;
  listFavorites: () => Promise<IpcResult<Favorite[]>>;
  addFavorite: (pkg: PackageInfo) => Promise<IpcResult<Favorite>>;
  removeFavorite: (id: string) => Promise<IpcResult<void>>;
  /** Resolves `true` if exported, `false` if the user cancelled the dialog. */
  exportFavorites: () => Promise<IpcResult<boolean>>;
  /** Resolves the merged favorites list, or `null` if the user cancelled the dialog. */
  importFavorites: () => Promise<IpcResult<Favorite[] | null>>;
  getPreferences: () => Promise<IpcResult<Preferences>>;
  setPreference: (key: keyof Preferences, value: Preferences[keyof Preferences]) => Promise<IpcResult<void>>;
}
