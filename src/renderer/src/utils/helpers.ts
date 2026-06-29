/** Truncates a string to maxLen characters, appending "…" if cut. */
export function truncateText(text: string, maxLen: number): string {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}

/** Formats a version string, returning "—" for empty values. */
export function formatVersion(version: string): string {
  return version?.trim() || "—";
}

/** Formats a package display name: capitalizes the first letter. */
export function formatPackageName(name: string): string {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Returns a new array sorted by `name` (French locale), ascending or descending. */
export function sortByName<T extends { name: string }>(list: readonly T[], ascending: boolean): T[] {
  return [...list].sort((a, b) =>
    ascending ? a.name.localeCompare(b.name, "fr") : b.name.localeCompare(a.name, "fr"),
  );
}
