import { contextBridge, ipcRenderer } from "electron";
import { IPC } from "../shared/ipc-channels";
import type { WindowApi } from "../shared/types";

const api: WindowApi = {
  searchPackages: (query) => ipcRenderer.invoke(IPC.WINGET_SEARCH, query),

  installPackages: (ids) => ipcRenderer.invoke(IPC.WINGET_INSTALL, ids),

  cancelInstall: () => ipcRenderer.invoke(IPC.WINGET_INSTALL_CANCEL),

  onInstallLog: (cb) => {
    const handler = (_e: Electron.IpcRendererEvent, line: string) => cb(line);
    ipcRenderer.on(IPC.INSTALL_LOG, handler);
    return () => ipcRenderer.removeListener(IPC.INSTALL_LOG, handler);
  },

  listInstalled: () => ipcRenderer.invoke(IPC.WINGET_LIST),

  listUpgrades: () => ipcRenderer.invoke(IPC.WINGET_UPGRADES),

  upgradePackage: (id) => ipcRenderer.invoke(IPC.WINGET_UPGRADE_ONE, id),

  listFavorites: () => ipcRenderer.invoke(IPC.FAVORITES_LIST),

  addFavorite: (pkg) => ipcRenderer.invoke(IPC.FAVORITES_ADD, pkg),

  removeFavorite: (id) => ipcRenderer.invoke(IPC.FAVORITES_REMOVE, id),

  exportFavorites: () => ipcRenderer.invoke(IPC.FAVORITES_EXPORT),

  importFavorites: () => ipcRenderer.invoke(IPC.FAVORITES_IMPORT),

  getPreferences: () => ipcRenderer.invoke(IPC.PREF_GET),

  setPreference: (key, value) => ipcRenderer.invoke(IPC.PREF_SET, { key, value }),
};

contextBridge.exposeInMainWorld("api", api);
