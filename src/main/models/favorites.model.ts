import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import * as config from "../../shared/config";
import type { Favorite, PackageInfo } from "../../shared/types";
import { FavoritesError } from "./errors";

function favoritesPath(): string {
  return join(app.getPath("userData"), config.FAVORITES_FILENAME);
}

function isFavorite(v: unknown): v is Favorite {
  if (typeof v !== "object" || v === null) return false;
  const f = v as Record<string, unknown>;
  return (["id", "name", "publisher", "version", "addedAt"] as const).every(
    (k) => typeof f[k] === "string",
  );
}

function isFavoriteArray(v: unknown): v is Favorite[] {
  return Array.isArray(v) && v.every(isFavorite);
}

async function readAll(): Promise<Favorite[]> {
  try {
    const raw = await readFile(favoritesPath(), "utf8");
    return JSON.parse(raw) as Favorite[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw new FavoritesError(`Lecture des favoris échouée : ${String(err)}`);
  }
}

async function writeAll(favorites: Favorite[]): Promise<void> {
  try {
    await writeFile(favoritesPath(), JSON.stringify(favorites, null, 2), "utf8");
  } catch (err) {
    throw new FavoritesError(`Écriture des favoris échouée : ${String(err)}`);
  }
}

/** Returns all saved favorites. */
export async function list(): Promise<Favorite[]> {
  return readAll();
}

/** Adds a package to favorites. Throws if already present. */
export async function add(pkg: PackageInfo): Promise<Favorite> {
  const favorites = await readAll();

  if (favorites.some((f) => f.id === pkg.id)) {
    throw new FavoritesError(`« ${pkg.name} » est déjà dans les favoris.`);
  }

  const favorite: Favorite = {
    id: pkg.id,
    name: pkg.name,
    publisher: pkg.publisher,
    version: pkg.version,
    addedAt: new Date().toISOString(),
  };

  favorites.push(favorite);
  await writeAll(favorites);
  return favorite;
}

/** Removes a favorite by package id. Throws if not found. */
export async function remove(id: string): Promise<void> {
  const favorites = await readAll();
  const filtered = favorites.filter((f) => f.id !== id);

  if (filtered.length === favorites.length) {
    throw new FavoritesError("Favori introuvable.");
  }

  await writeAll(filtered);
}

/** Writes the current favorites to an arbitrary path (export). Returns the count written. */
export async function exportTo(filePath: string): Promise<number> {
  const favorites = await readAll();
  try {
    await writeFile(filePath, JSON.stringify(favorites, null, 2), "utf8");
  } catch (err) {
    throw new FavoritesError(`Export des favoris échoué : ${String(err)}`);
  }
  return favorites.length;
}

/**
 * Merges favorites from a JSON file into the existing list (no duplicate by id),
 * persists, and returns the merged list. Validates the file content first.
 */
export async function importFrom(filePath: string): Promise<Favorite[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    throw new FavoritesError("Le fichier sélectionné n'est pas un JSON valide.");
  }
  if (!isFavoriteArray(parsed)) {
    throw new FavoritesError("Le fichier ne contient pas une liste de favoris valide.");
  }

  const byId = new Map((await readAll()).map((f) => [f.id, f]));
  for (const fav of parsed) {
    if (!byId.has(fav.id)) byId.set(fav.id, fav);
  }
  const merged = [...byId.values()];
  await writeAll(merged);
  return merged;
}
