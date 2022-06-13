const path = require("path");
const {
  app,
  BrowserWindow,
  dialog,
  screen,
  BrowserView,
  ipcMain,
} = require("electron");
const isDev = require("electron-is-dev");
const fs = require("fs");
const mainWindowPosition = { x: 0, y: 0 };

function createWindow() {
  // Create the browser window.

  const preload = `${__dirname}/preload.js`;

  const win = (mainWindow = new BrowserWindow({
    useContentSize: true,
    minWidth: 1000,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      nativeWindowOpen: true,
      preload,
      experimentalCanvasFeatures: true,
    },
  }));

  // const displays = screen.getAllDisplays();
  // console.log({ displays });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

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

  win.webContents.setWindowOpenHandler(
    ({ url, frameName, features, ...rest }) => {
      console.log(`setWindowOpenHandler '${frameName}'`, { features, rest });

      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          frame: false,
          parent: mainWindow,
          roundedCorners: false,
          transparent: true,
        },

        webPreferences: {
          preload,
        },
      };
    }
  );

  ipcMain.on("window-resize", (event, arg) => {
    console.log(`window resize ${arg.width}`);
    win.setSize(arg.width, arg.height);
  });

  win.on("moved", (evt) => {
    const { x, y, width, height } = evt.sender.getBounds();
    mainWindowPosition.x = x;
    mainWindowPosition.y = y;
  });

  const windowByTitle = (title) =>
    BrowserWindow.getAllWindows().find((w) => w.title === title);

  ipcMain.on("window-size", (event, { id, height, width }) => {
    const targetWindow = windowByTitle(id);
    if (targetWindow) {
      targetWindow.setContentSize(width, height);
    }
  });

  ipcMain.on("window-position", (event, { id, left, top }) => {
    const mainWindow = windowByTitle("Theme Editor Showcase");
    const mainBounds = mainWindow.getContentBounds();
    const targetWindow = windowByTitle(id);

    const targetX = parseInt(left + mainBounds.x);
    const targetY = parseInt(top + mainBounds.y);

    try {
      targetWindow.setPosition(targetX, targetY);
    } catch (e) {
      console.log(`error setting position`, e);
    }
  });

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  const view = new BrowserView();
  win.setBrowserView(view);
  view.setBounds({
    x: 240,
    y: 0,
    width: win.getContentBounds().width,
    height: win.getContentBounds().height,
  });
  view.setAutoResize({ width: true, height: true });
  view.webContents.loadURL("http://localhost:3005");
  view.webContents.openDevTools({ mode: "detach" });

  ipcMain.on("update-styles", (event, styles) => {
    view.webContents.executeJavaScript(`
      document.head.append(document.createElement('style'));
      document.head.lastChild.innerText = ${styles}
    `);
  });

  ipcMain.on("save-styles", async (event, cssByPattern) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    const dirName = result.filePaths[0];

    UITK_FOUNDATIONS.forEach(
      async (foundation) =>
        await fs.writeFileSync(
          dirName + `/index.css`,
          `@import url(foundations/${foundation}.css);\n`,
          { flag: "a" }
        )
    );
    UITK_CHARACTERISTICS.forEach(
      async (characteristic) =>
        await fs.writeFileSync(
          dirName + `/index.css`,
          `@import url(characteristics/${characteristic}.css);\n`,
          { flag: "a" }
        )
    );

    fs.mkdir(dirName + `/characteristics`, (err) => console.log(err));
    fs.mkdir(dirName + `/foundations`, (err) => console.log(err));

    try {
      for (var element of cssByPattern) {
        var patternName = element.pattern;
        var cssString = element.cssObj;
        var patternType = UITK_CHARACTERISTICS.includes(patternName)
          ? "characteristics"
          : "foundations";
        fs.writeFileSync(
          dirName + `/${patternType}/${patternName}.css`,
          cssString.replaceAll("\n", "")
        );
      }
    } catch (err) {
      console.log(err);
    }
  });

  ipcMain.handle("select-dir", async (event, arg) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    const dirName = result.filePaths[0];

    try {
      const theme = await fs.promises.readdir(dirName).then(async (files) => {
        let themeContents = "";
        for (const file of files) {
          if (file === "index.css") {
            var indexContents = fs.readFileSync(dirName + "/" + file, "utf8");
            themeContents += await recurseDirectory(dirName, indexContents);
          }
        }
        return themeContents;
      });

      return [theme, dirName.split("/").slice(-1)[0]];
    } catch (error) {
      console.log(error);
    }
  });
}

var UITK_CHARACTERISTICS = [
  "accent",
  "actionable",
  "container",
  "delay",
  "disabled",
  "draggable",
  "dropTarget",
  "editable",
  "focused",
  "measured",
  "navigable",
  "overlayable",
  "ratable",
  "selectable",
  "separable",
  "status",
  "taggable",
  "text",
];

var UITK_FOUNDATIONS = [
  "color",
  "fade",
  "icon",
  "shadow",
  "size",
  "spacing",
  "typography",
  "zindex",
];

async function recurseDirectory(dirName, fileContents) {
  let allContents = "";

  for (var line of fileContents.split("\n")) {
    if (line.startsWith("@import")) {
      var importURL = /\(\s*([^)]+?)\s*\)/.exec(line);

      if (importURL) {
        var url = importURL[1];
        var importedContents = fs.readFileSync(dirName + "/" + url, "utf8");
        if (
          UITK_CHARACTERISTICS.concat(UITK_FOUNDATIONS).indexOf(
            url.split("/")[1].replace(".css", "")
          ) !== -1
        ) {
          allContents += importedContents;
        } else {
          var subDirName = dirName + "/" + url.split("/")[0];
          allContents += await recurseDirectory(subDirName, importedContents);
        }
      }
    } else {
      continue;
    }
  }

  return allContents;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
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
