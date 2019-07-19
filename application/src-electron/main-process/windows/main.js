let main = {
  hide,
  init,
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

  let win = (main.win = new electron.BrowserWindow({
    backgroundColor: "#E7E7E7",
    darkTheme: true, // Forces dark theme (GTK+3)
    icon: getIconPath(), // Window icon (Windows, Linux)
    width: 417,
    height: 860,
    show: false, // Hide window until renderer sends 'ipcReady'
    title: "Copycat - A shared clipboard",
    titleBarStyle: "hidden-inset", // Hide title bar (OS X)
    useContentSize: true, // Specify web page size without OS chrome
    webPreferences: {
      nodeIntegration: true
    }
  }));

  win.loadURL(process.env.APP_URL);

  win.webContents.on("dom-ready", () => {
    console.log("Dom Ready!");
  });

  win.on("enter-full-screen", () => {
    console.log("Enter full screen.");
  });

  win.on("leave-full-screen", () => {
    console.log("Enter full screen.");
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.on("close", e => {
    if (process.platform !== "darwin" && !tray.hasTray()) {
      app.quit();
    } else if (!app.isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function hide() {
  if (!main.win) return;
  main.win.hide();
}

function getIconPath() {
  if (process.platform === "darwin") {
    return "";
  } else if (process.platform === "linux") {
    return "";
  } else {
    return "";
  }
}

function send(...args) {
  if (!main.win) return;
  main.win.send(...args);
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
