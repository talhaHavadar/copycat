import { app, ipcMain, clipboard } from "electron";
import path from "path";
import settings from "electron-settings";
import windows from "./windows";
import tray from "./tray";
import menu from "./menu";
import CopycatSwarm from "../../networking/Swarm";
import { ClipboardManager, ElectronClipboardAdapter } from "../../clipboard";

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = path.join(__dirname, "statics").replace(/\\/g, "\\\\");
}

let swarm;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (windows.main.win) {
      if (windows.main.win.isMinimized()) windows.main.win.restore();
      windows.main.win.focus();
    }
  });
  app.on("ready", startApp);

  app.on("window-all-closed", () => {
    // if (process.platform !== "darwin") {
    //   app.quit();
    // }
  });

  app.on("activate", () => {
    windows.main.init();
  });
}

function startApp() {
  let allowedDevices = settings.get("whitelist", []);
  swarm = new CopycatSwarm();
  let clipboardManager = new ClipboardManager(
    new ElectronClipboardAdapter(clipboard)
  );
  var lastDataFromRemote = undefined;
  swarm.start();

  clipboardManager.setChangeEvent(clip => {
    console.log("Clipboard Changed: ", clip);
    if (clip !== lastDataFromRemote) swarm.broadcast(clip);
  });

  clipboardManager.startListening();

  swarm.setOnDataListener(data => {
    lastDataFromRemote = data;
    clipboardManager.copy(data.toString());
  });

  swarm.setOnWhitelistUpdatedListener(device => {
    if (device.disabled == false) {
      allowedDevices.push(device.machine.id);
      settings.set("whitelist", allowedDevices);
    } else if (allowedDevices.includes(device.machine.id)) {
      allowedDevices.splice(allowedDevices.indexOf(device.machine.id), 1);
      settings.set("whitelist", allowedDevices);
    }
  });

  ipcMain.on("getDevices", (event, arg) => {
    let devices = [];
    for (const id in swarm.peers) {
      if (swarm.peers.hasOwnProperty(id)) {
        const peer = swarm.peers[id];
        let device = {
          id: peer.connectionId,
          name: peer.name,
          ip_addr: `${peer.info.host}:${peer.info.port}`,
          disabled: peer.disabled
        };
        devices.push(device);
      }
    }
    event.returnValue = devices;
  });

  ipcMain.on("updateDevice", (event, args) => {
    let { id } = args;
    swarm.updateDevice(id, args);
  });

  windows.main.init();
  app.on("before-quit", () => {
    clipboardManager.destroy();
    swarm.destroy();
  });

  menu.init();
  tray.init();
}
