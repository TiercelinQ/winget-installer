import { ipcMain } from "electron";
import { IPC } from "../../shared/ipc-channels";
import type { IpcResult, Preferences } from "../../shared/types";
import * as PreferencesModel from "../models/preferences.model";
import { PreferencesError } from "../models/errors";

const VALID_THEMES = new Set<Preferences["theme"]>(["light", "dark", "system"]);
const VALID_TABS = new Set<Preferences["startupTab"]>(["catalog", "installed", "updates", "favorites"]);

interface SetPayload {
  key: keyof Preferences;
  value: Preferences[keyof Preferences];
}

function isValidSetPayload(v: unknown): v is SetPayload {
  if (typeof v !== "object" || v === null) return false;
  const p = v as SetPayload;
  if (p.key === "theme") return VALID_THEMES.has(p.value as Preferences["theme"]);
  if (p.key === "startupTab") return VALID_TABS.has(p.value as Preferences["startupTab"]);
  return false;
}

export function registerPreferencesController(): void {
  ipcMain.handle(IPC.PREF_GET, async (): Promise<IpcResult<Preferences>> => {
    try {
      return { ok: true, data: await PreferencesModel.get() };
    } catch (err) {
      if (err instanceof PreferencesError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });

  ipcMain.handle(IPC.PREF_SET, async (_e, payload: unknown): Promise<IpcResult<void>> => {
    if (!isValidSetPayload(payload)) {
      return { ok: false, error: { type: "warning", message: "Préférence invalide." } };
    }
    try {
      await PreferencesModel.set(payload.key, payload.value);
      return { ok: true, data: undefined };
    } catch (err) {
      if (err instanceof PreferencesError) return { ok: false, error: { type: "danger", message: err.message } };
      throw err;
    }
  });
}
