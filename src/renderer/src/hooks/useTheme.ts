import { useState, useEffect, useCallback } from "react";
import type { Preferences } from "../../../shared/types";

type Theme = Preferences["theme"];

function applyTheme(theme: Theme): void {
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
  } else {
    document.documentElement.dataset.theme = theme;
  }
}

/** Manages the active theme and persists changes via IPC. */
export function useTheme(initial: Theme = "system"): [Theme, (t: Theme) => Promise<void>] {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Follow OS theme changes when set to "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Stable identity: consumers depend on this in effects; an unstable reference
  // would re-trigger their mount-only effects on every render.
  const setAndPersist = useCallback(async (t: Theme): Promise<void> => {
    setTheme(t);
    await window.api.setPreference("theme", t);
  }, []);

  return [theme, setAndPersist];
}
