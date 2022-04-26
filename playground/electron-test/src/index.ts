import { app, BrowserWindow, ipcMain } from "electron";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: any;

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.

  const mainWindow = new BrowserWindow({
    height: 525,
    width: 700,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      nativeWindowOpen: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  ipcMain.on("window-close", (event, { id }) => {
    const targetWindow = windowByTitle(id);
    if (targetWindow) {
      let childWindows = BrowserWindow.getAllWindows();
      console.log(`before close we have ${childWindows.length} windows`);

      console.log(`close this window`);
      targetWindow.destroy();
      childWindows = BrowserWindow.getAllWindows();
      console.log(`after close we have ${childWindows.length} windows`);
    }
  });

  ipcMain.on("window-ready", (event, { id }) => {
    const targetWindow = windowByTitle(id);
    if (targetWindow) targetWindow.showInactive();
  });

  mainWindow.webContents.setWindowOpenHandler(
    ({ url, frameName, features, ...rest }) => {
      console.log(`setWindowOpenHandler '${frameName}'`, { features, rest });

      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          show: false,
          frame: false,
          parent: mainWindow,
          roundedCorners: false,
          // resizable:false,
          transparent: true,
        },

        webPreferences: {
          preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
      };
    }
  );

  ipcMain.on("window-resize", (event, arg) => {
    console.log(`window resize ${arg.width}`);
    mainWindow.setSize(arg.width, arg.height);
  });

  const windowByTitle = (title: string) =>
    BrowserWindow.getAllWindows().find((w) => w.title === title);

  ipcMain.on("window-size", (event, { id, height, width }) => {
    console.log(id, width, height);
    const targetWindow = windowByTitle(id);
    if (targetWindow) {
      targetWindow.setContentSize(width, height);
      targetWindow.setMaximumSize(width, height);
    }
  });

  ipcMain.on("window-position", (event, { id, parentWindowID, left, top }) => {
    const targetWindow = windowByTitle(id);
    let mainWindow = windowByTitle(parentWindowID);
    if (!mainWindow && targetWindow) {
      // @ts-ignore
      mainWindow = targetWindow.getParentWindow();
    }
    if (targetWindow) {
      const mainBounds = mainWindow!.getContentBounds();

      const targetX = parseInt(left + mainBounds.x);
      const targetY = parseInt(top + mainBounds.y);
      try {
        targetWindow.setPosition(targetX, targetY);
        // @ts-ignore
      } catch (e) {
        console.log(`error setting position`, e);
      }
    }
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
