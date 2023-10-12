import {
  app,
  shell,
  BrowserWindow,
  globalShortcut,
  Event,
  protocol,
} from "electron";
import { join, resolve } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png";
import { createIPCHandler } from "electron-trpc/main";
import { getRouter } from "./api";
import log from "./logger";
import { MainHandle, mainTracksManager } from "./lightrail-main";
import { TRACKS_DIR } from "./track-admin";
import setUpUpdates from "update-electron-app";
import { fetchTrackUpdates } from "./updates";
import { debounce } from "throttle-debounce";

setUpUpdates();

protocol.registerSchemesAsPrivileged([
  {
    scheme: "lightrailtrack",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      allowServiceWorkers: true,
      bypassCSP: true,
    },
  },
]);

let mainWindow: BrowserWindow;

const toggleWindow = debounce(
  500,
  () => {
    if (!mainWindow) {
      createWindow();
    } else if (mainWindow.isVisible()) {
      mainWindow.hide();
      log.silly("Window hidden");
    } else {
      mainWindow.show();
      log.silly("Window shown");
    }
  },
  {
    atBegin: true,
  }
);

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

  window.on("show", () => {
    fetchTrackUpdates();
  });
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

  // Set up track access from renderer
  protocol.registerFileProtocol("lightrailtrack", (req, callback) => {
    const path = req.url.replace("lightrailtrack://", "");
    callback(resolve(TRACKS_DIR, path));
  });

  mainTracksManager.processHandleFactory = (track) =>
    new MainHandle(track, mainWindow);

  log.silly("Creating IPC handler");
  createIPCHandler({
    router: getRouter(mainWindow),
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
  globalShortcut.register("CommandOrControl+Shift+Space", toggleWindow);
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
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  createWindow();
});

app.on("window-all-closed", (e) => {
  e.preventDefault();
  e.returnValue = false;
});
