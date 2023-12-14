let trayExport = {
  hasTray,
  init,
  onWindowBlur,
  onWindowFocus
};

import electron from "electron";
import windows from "./windows";

let app = electron.app;
let tray;

function init() {
  if (process.platform === "linux") {
    initLinux();
  }
  if (process.platform === "win32") {
    initWin32();
  }
  // OS X apps generally do not have menu bar icons
  // TODO: add a tray with template icon for osx
}

/**
 * Returns true if there a tray icon is active.
 */
function hasTray() {
  return !!tray;
}

function onWindowBlur() {
  if (!tray) return;
  updateTrayMenu();
}

function onWindowFocus() {
  if (!tray) return;
  updateTrayMenu();
}

function initLinux() {
  checkLinuxTraySupport(function(supportsTray) {
    if (supportsTray) createTray();
  });
}

function initWin32() {
  createTray();
}

/**
 * Check for libappindicator1 support before creating tray icon
 */
function checkLinuxTraySupport(cb) {
  var cp = require("child_process");

  // Check that we're on Ubuntu (or another debian system) and that we have
  // libappindicator1. If WebTorrent was installed from the deb file, we should
  // always have it. If it was installed from the zip file, we might not.
  cp.exec("dpkg --get-selections libappindicator1", function(err, stdout) {
    if (err) return cb(false);
    // Unfortunately there's no cleaner way, as far as I can tell, to check
    // whether a debian package is installed:
    cb(stdout.endsWith("\tinstall\n"));
  });
}

function createTray() {
  tray = new electron.Tray(getIconPath());

  // On Windows, left click opens the app, right click opens the context menu.
  // On Linux, any click (left or right) opens the context menu.
  tray.on("click", () => windows.main.show());

  // Show the tray context menu, and keep the available commands up to date
  updateTrayMenu();
}

function updateTrayMenu() {
  var contextMenu = electron.Menu.buildFromTemplate(getMenuTemplate());
  tray.setContextMenu(contextMenu);
}

function getMenuTemplate() {
  return [
    {
      label: "Show Copycat",
      click: () => windows.main.show()
    },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ];
}

function getIconPath() {
  // TODO: make it platform independent
  let path = require("path");
  return path.join(__dirname, "../icons/linux-512x512.png");
}

export default trayExport;
