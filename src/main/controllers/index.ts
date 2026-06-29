import type { WebContents } from "electron";
import { registerWingetController } from "./winget.controller";
import { registerFavoritesController } from "./favorites.controller";
import { registerPreferencesController } from "./preferences.controller";

/** Registers all IPC controllers. Call once after BrowserWindow is created. */
export function registerAllControllers(webContents: WebContents): void {
  registerWingetController(webContents);
  registerFavoritesController();
  registerPreferencesController();
}
