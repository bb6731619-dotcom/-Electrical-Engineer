const { app, BrowserWindow } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
let mainWindow;

function createWindow() {
  autoUpdater.checkForUpdatesAndNotify();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1200,
    minHeight: 700,
    center: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon-512.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile("index.html");
  mainWindow.maximize();

  // منع DevTools
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (
      (input.control && input.shift && input.key.toLowerCase() === "i") ||
      input.key === "F12"
    ) {
      event.preventDefault();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
autoUpdater.on("update-available", () => {
  console.log("Update available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("update_ready");
});
