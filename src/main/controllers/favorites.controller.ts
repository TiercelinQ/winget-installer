import { ipcMain, dialog, BrowserWindow } from "electron";
import { IPC } from "../../shared/ipc-channels";
import type { IpcResult, Favorite, PackageInfo } from "../../shared/types";
import * as FavoritesModel from "../models/favorites.model";
import { FavoritesError } from "../models/errors";

const JSON_FILTER = [{ name: "JSON", extensions: ["json"] }];

function isPackageInfo(v: unknown): v is PackageInfo {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as PackageInfo).id === "string" &&
    (v as PackageInfo).id.trim().length > 0 &&
    typeof (v as PackageInfo).name === "string"
  );
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function registerFavoritesController(): void {
  ipcMain.handle(IPC.FAVORITES_LIST, async (): Promise<IpcResult<Favorite[]>> => {
    try {
      return { ok: true, data: await FavoritesModel.list() };
    } catch (err) {
      if (err instanceof FavoritesError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });

  ipcMain.handle(IPC.FAVORITES_ADD, async (_e, payload: unknown): Promise<IpcResult<Favorite>> => {
    if (!isPackageInfo(payload)) {
      return { ok: false, error: { type: "warning", message: "Données du paquet invalides." } };
    }
    try {
      return { ok: true, data: await FavoritesModel.add(payload) };
    } catch (err) {
      if (err instanceof FavoritesError) return { ok: false, error: { type: "warning", message: err.message } };
      throw err;
    }
  });

  ipcMain.handle(IPC.FAVORITES_REMOVE, async (_e, payload: unknown): Promise<IpcResult<void>> => {
    if (!isNonEmptyString(payload)) {
      return { ok: false, error: { type: "warning", message: "Identifiant de favori invalide." } };
    }
    try {
      await FavoritesModel.remove(payload);
      return { ok: true, data: undefined };
    } catch (err) {
      if (err instanceof FavoritesError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });

  ipcMain.handle(IPC.FAVORITES_EXPORT, async (): Promise<IpcResult<boolean>> => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
    const options = {
      title: "Exporter les favoris",
      defaultPath: "favoris-winget-hub.json",
      filters: JSON_FILTER,
    };
    const { canceled, filePath } = win
      ? await dialog.showSaveDialog(win, options)
      : await dialog.showSaveDialog(options);
    if (canceled || !filePath) return { ok: true, data: false };
    try {
      await FavoritesModel.exportTo(filePath);
      return { ok: true, data: true };
    } catch (err) {
      if (err instanceof FavoritesError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });

  ipcMain.handle(IPC.FAVORITES_IMPORT, async (): Promise<IpcResult<Favorite[] | null>> => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
    const options = {
      title: "Importer des favoris",
      filters: JSON_FILTER,
      properties: ["openFile" as const],
    };
    const { canceled, filePaths } = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options);
    if (canceled || filePaths.length === 0) return { ok: true, data: null };
    try {
      return { ok: true, data: await FavoritesModel.importFrom(filePaths[0]) };
    } catch (err) {
      if (err instanceof FavoritesError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });
}
