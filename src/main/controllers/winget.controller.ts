import { ipcMain, type WebContents } from "electron";
import { IPC } from "../../shared/ipc-channels";
import type { IpcResult, PackageInfo, InstalledPackage, UpgradeInfo } from "../../shared/types";
import * as WingetModel from "../models/winget.model";
import { WingetError } from "../models/errors";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string" && x.trim().length > 0);
}

/** Registers all winget IPC handlers. webContents is used to push install:log events. */
export function registerWingetController(webContents: WebContents): void {
  ipcMain.handle(IPC.WINGET_SEARCH, async (_e, payload: unknown): Promise<IpcResult<PackageInfo[]>> => {
    if (!isNonEmptyString(payload)) {
      return { ok: false, error: { type: "warning", message: "Requête de recherche invalide." } };
    }
    try {
      return { ok: true, data: await WingetModel.search(payload) };
    } catch (err) {
      if (err instanceof WingetError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });

  ipcMain.handle(IPC.WINGET_INSTALL, async (_e, payload: unknown): Promise<IpcResult<void>> => {
    if (!isStringArray(payload)) {
      return { ok: false, error: { type: "warning", message: "Liste de paquets invalide." } };
    }
    try {
      await WingetModel.install(payload, (line) => {
        if (!webContents.isDestroyed()) webContents.send(IPC.INSTALL_LOG, line);
      });
      return { ok: true, data: undefined };
    } catch (err) {
      if (err instanceof WingetError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });

  ipcMain.handle(IPC.WINGET_INSTALL_CANCEL, async (): Promise<IpcResult<void>> => {
    WingetModel.cancelInstall();
    return { ok: true, data: undefined };
  });

  ipcMain.handle(IPC.WINGET_LIST, async (): Promise<IpcResult<InstalledPackage[]>> => {
    try {
      return { ok: true, data: await WingetModel.list() };
    } catch (err) {
      if (err instanceof WingetError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });

  ipcMain.handle(IPC.WINGET_UPGRADES, async (): Promise<IpcResult<UpgradeInfo[]>> => {
    try {
      return { ok: true, data: await WingetModel.upgrades() };
    } catch (err) {
      if (err instanceof WingetError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });

  ipcMain.handle(IPC.WINGET_UPGRADE_ONE, async (_e, payload: unknown): Promise<IpcResult<void>> => {
    if (!isNonEmptyString(payload)) {
      return { ok: false, error: { type: "warning", message: "Identifiant de paquet invalide." } };
    }
    try {
      await WingetModel.upgradeOne(payload, (line) => {
        if (!webContents.isDestroyed()) webContents.send(IPC.INSTALL_LOG, line);
      });
      return { ok: true, data: undefined };
    } catch (err) {
      if (err instanceof WingetError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });
}
