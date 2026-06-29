import { app, BrowserWindow, session } from "electron";
import { join } from "node:path";
import { registerAllControllers } from "./controllers";

process.on("uncaughtException", (err) => {
  console.error("[WinGet Hub] Erreur non gérée:", err);
});

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, "../../resources/icon.ico"),
    backgroundColor: "#F3F3F3",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      preload: join(__dirname, "../preload/index.js"),
    },
  });

  registerAllControllers(win.webContents);

  if (process.env.NODE_ENV === "development") {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"] ?? "http://localhost:5173");
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }

  win.once("ready-to-show", () => win.show());

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  return win;
}

app.requestSingleInstanceLock();

app.on("web-contents-created", (_e, contents) => {
  contents.on("will-navigate", (e) => e.preventDefault());
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
});

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(false);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
