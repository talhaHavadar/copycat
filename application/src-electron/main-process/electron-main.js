import { app, BrowserWindow, Menu, shell, Tray, ipcMain } from "electron";
import path from "path";
import settings from "electron-settings";
import CopycatSwarm from "./networking/Swarm";
import ClipboardManager from "./clipboard/ClipboardManager";

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require("path")
    .join(__dirname, "statics")
    .replace(/\\/g, "\\\\");
}

let mainWindow;
let tray;
let swarm;

function startApp() {
  let allowedDevices = settings.get("whitelist", []);
  swarm = new CopycatSwarm();
  let clipboardManager = new ClipboardManager();
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

  createWindow();
  generateMenu();
  generateTray();
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    backgroundColor: "#E7E7E7",
    titleBarStyle: "hidden",
    width: 417,
    height: 860,
    show: false,
    // useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(process.env.APP_URL);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("close", event => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
      event.returnValue = false;
    } else {
      swarm.destroy();
    }
  });
}

function generateMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        { role: "about" },
        {
          label: "Quit",
          click() {
            app.isQuiting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" }
      ]
    },
    {
      role: "help",
      submenu: [
        {
          click() {
            shell.openExternal("https://github.com/talhahavadar/copycat");
          },
          label: "Learn More"
        },
        {
          click() {
            shell.openExternal(
              "https://github.com/talhahavadar/copycat/issues"
            );
          },
          label: "File Issue on GitHub"
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function generateTray() {
  tray = new Tray(path.join(__dirname, "../icons/linux-512x512.png"));
  var contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      }
    },
    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip("Copycat - A Shared Clipboard");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    if (mainWindow != null) mainWindow.show();
    else createWindow();
  });
}

app.on("ready", startApp);

app.on("window-all-closed", () => {
  // if (process.platform !== "darwin") {
  //   app.quit();
  // }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
