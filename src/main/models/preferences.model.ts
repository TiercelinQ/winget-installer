import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import * as config from "../../shared/config";
import type { Preferences } from "../../shared/types";
import { PreferencesError } from "./errors";

const DEFAULTS: Preferences = {
  theme: "system",
  startupTab: "catalog",
};

function preferencesPath(): string {
  return join(app.getPath("userData"), config.PREFERENCES_FILENAME);
}

/**
 * Returns the current preferences, merged with defaults for missing keys.
 * A missing or corrupted file falls back to defaults (self-healing on next set)
 * rather than throwing — preferences are non-critical and must never brick the app.
 */
export async function get(): Promise<Preferences> {
  let raw: string;
  try {
    raw = await readFile(preferencesPath(), "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { ...DEFAULTS };
    throw new PreferencesError(`Lecture des préférences échouée : ${String(err)}`);
  }
  try {
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Persists a single preference key/value pair. */
export async function set<K extends keyof Preferences>(key: K, value: Preferences[K]): Promise<void> {
  try {
    const current = await get();
    await writeFile(preferencesPath(), JSON.stringify({ ...current, [key]: value }, null, 2), "utf8");
  } catch (err) {
    if (err instanceof PreferencesError) throw err;
    throw new PreferencesError(`Écriture des préférences échouée : ${String(err)}`);
  }
}
