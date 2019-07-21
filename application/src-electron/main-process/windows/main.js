let main = {
  hide,
  init,
  dispatch,
  send,
  setProgress,
  setTitle,
  show,
  toggleDevTools,
  win: null
};

import electron from "electron";
import tray from "../tray";

let app = electron.app;

function init() {
  if (main.win) {
    return main.win.show();
  }

  // eslint-disable-next-line prettier/prettier
  let win = main.win = new electron.BrowserWindow({
    backgroundColor: "#E7E7E7",
    darkTheme: true, // Forces dark theme (GTK+3)
    icon: getIconPath(), // Window icon (Windows, Linux)
    width: 417,
    height: 860,
    resizable: false,
    fullscreenable: false,
    show: false, // Hide window until renderer sends 'ipcReady'
    title: "Copycat - A shared clipboard",
    titleBarStyle: "hidden-inset", // Hide title bar (OS X)
    useContentSize: true, // Specify web page size without OS chrome
    webPreferences: {
      nodeIntegration: true
    }
    // eslint-disable-next-line prettier/prettier
  });

  win.loadURL(process.env.APP_URL);

  win.webContents.on("dom-ready", () => {
    console.log("Dom Ready!");
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.on("close", e => {
    if (process.platform !== "darwin" && !tray.hasTray()) {
      app.isQuitting = true;
      app.quit();
    } else if (!app.isQuitting) {
      e.preventDefault();
      win.hide();
    }
    if (app.isQuitting) {
      win.removeAllListeners();
    }
  });
}

function hide() {
  if (!main.win) return;
  main.win.hide();
}

function getIconPath() {
  let path = require("path");
  if (process.platform === "darwin") {
    return path.join(__dirname, "../../icons/icon.icns");
  } else if (process.platform === "linux") {
    return path.join(__dirname, "../../icons/linux-512x512.png");
  } else {
    return path.join(__dirname, "../../icons/icon.ico");
  }
}

function send(...args) {
  if (!main.win) return;
  main.win.send(...args);
}

function dispatch(...args) {
  send("dispatch", ...args);
}

/**
 * Set progress bar to [0, 1]. Indeterminate when > 1. Remove with < 0.
 */
function setProgress(progress) {
  if (!main.win) return;
  main.win.setProgressBar(progress);
}

function setTitle(title) {
  if (!main.win) return;
  main.win.setTitle(title);
}

function show() {
  if (!main.win) return;
  main.win.show();
}

function toggleDevTools() {
  if (!main.win) return;
  console.log("toggleDevTools");
  if (main.win.webContents.isDevToolsOpened()) {
    main.win.webContents.closeDevTools();
  } else {
    main.win.webContents.openDevTools({ detach: true });
  }
}

export default main;
