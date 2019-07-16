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

function startApp() {
  let allowedDevices = settings.get("whitelist", []);
	let sense = new CopycatSwarm();
	let clipboardManager = new ClipboardManager();
	var lastDataFromRemote = undefined;
	sense.start();

	clipboardManager.setChangeEvent((clip) => {
		console.log("Clipboard Changed: ", clip);
		if (clip !== lastDataFromRemote)
			sense.broadcast(clip);
	});

	clipboardManager.startListening();

	sense.setOnDataListener((data) => {
		lastDataFromRemote = data;
		clipboardManager.copy(data.toString())
	});

	sense.setOnWhitelistUpdatedListener((device) => {
		if (device.disabled == false) {
			allowedDevices.push(device.machine.id)
			settings.set("whitelist", allowedDevices)
		} else if (allowedDevices.includes(device.machine.id)) {
			allowedDevices.splice(allowedDevices.indexOf(device.machine.id), 1)
			settings.set("whitelist", allowedDevices)
		}
	});

	ipcMain.on('getDevices', (event, arg) => {
		let devices = []
		for (const id in sense.peers) {
			if (sense.peers.hasOwnProperty(id)) {
				const peer = sense.peers[id];
				let device = {
					id: peer.connectionId,
					name: peer.name,
					ip_addr: `${peer.info.host}:${peer.info.port}`,
					disabled: peer.disabled
				}
				devices.push(device)
			}
		}
		event.returnValue = devices
	});

	ipcMain.on('updateDevice', (event, args) => {
		let { id } = args
		sense.updateDevice(id, args)
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

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("minimize", event => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function generateMenu() {
  const template = [
    {
      label: "File",
      submenu: [{ role: "about" }, { role: "quit" }]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteandmatchstyle" },
        { role: "delete" },
        { role: "selectall" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      role: "window",
      submenu: [{ role: "minimize" }, { role: "close" }]
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
        if (mainWindow) {
          console.log("Show App: mainWindow =>", mainWindow);
          console.log("Show App: restore =>", mainWindow.restore());
          console.log("Show App: show =>", mainWindow.show());
        } else {
          console.log("Show App: Create mainWindow =>", mainWindow);
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
