import { app, shell, BrowserWindow, globalShortcut, Event } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png";
import { createIPCHandler } from "electron-trpc/main";
import { getRouter } from "./api";
import { MainLightrail } from "./main-lightrail";
import log from "./logger";

let mainWindow: BrowserWindow;

function postConfigure(window: BrowserWindow) {
  window.webContents.on(
    "will-navigate",
    function (event: Event, reqUrl: string) {
      let requestedHost = new URL(reqUrl).host;
      let currentHost = new URL(window.webContents.getURL()).host;
      if (requestedHost && requestedHost != currentHost) {
        event.preventDefault();
        shell.openExternal(reqUrl);
      }
    }
  );
}

function createWindow(): void {
  log.silly("Creating window");
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 600,
    height: 100,
    // resizable: false,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
    backgroundColor: "#0A0A0A",
  });

  const mainLightrail = new MainLightrail(mainWindow);

  log.silly("Creating IPC handler");
  createIPCHandler({
    router: getRouter(mainLightrail),
    windows: [mainWindow],
  });

  mainWindow.on("ready-to-show", () => {
    log.silly("Window ready to show");
    mainWindow.show();
    log.silly("Window shown");
  });

  if (!is.dev) {
    mainWindow.on("blur", () => {
      mainWindow.hide();
      log.silly("Window hidden");
    });
  }

  // Apply postConfigure to mainWindow
  postConfigure(mainWindow);

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    log.silly("Loading renderer from " + process.env["ELECTRON_RENDERER_URL"]);
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    log.silly(
      "Loading renderer from " + join(__dirname, "../renderer/index.html")
    );
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  log.silly("App ready");
  log.silly("Registering global shortcut");
  globalShortcut.register("CommandOrControl+Shift+Space", () => {
    if (!mainWindow) {
      createWindow();
    } else if (mainWindow.isVisible()) {
      mainWindow.hide();
      log.silly("Window hidden");
    } else {
      mainWindow.show();
      log.silly("Window shown");
    }
  });
  // Set app user model id for windows
  log.silly("Setting app user model id");
  electronApp.setAppUserModelId("com.lightrail");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  createWindow();
});

app.on("window-all-closed", (e) => {
  e.preventDefault();
  e.returnValue = false;
});
