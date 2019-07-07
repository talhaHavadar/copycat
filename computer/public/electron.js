const { app, BrowserWindow, shell, ipcMain, Menu, TouchBar, Tray } = require('electron');
const { TouchBarButton, TouchBarLabel, TouchBarSpacer } = TouchBar;
const CopycatSwarm = require('./networking/Swarm');
const ClipboardManager = require('./clipboard/ClipboardManager');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let tray;

if (isDev) {
	console.log('Running in development');
} else {
	console.log('Running in production');
}

createWindow = () => {
	mainWindow = new BrowserWindow({
		backgroundColor: '#E7E7E7',
		show: false,
		titleBarStyle: 'hidden',
		webPreferences: {
			nodeIntegration: false,
			preload: path.join(__dirname, '/preload.js'),
		},
		height: 860,
		width: 417,
	});

	mainWindow.loadURL(
		isDev
			? 'http://localhost:3000'
			: `file://${path.join(__dirname, '/index.html')}`,
	);

	if (isDev) {
		const {
			default: installExtension,
			REACT_DEVELOPER_TOOLS,
			REDUX_DEVTOOLS,
		} = require('electron-devtools-installer');

		installExtension(REACT_DEVELOPER_TOOLS)
			.then(name => {
				console.log(`Added Extension: ${name}`);
			})
			.catch(err => {
				console.log('An error occurred: ', err);
			});

		installExtension(REDUX_DEVTOOLS)
			.then(name => {
				console.log(`Added Extension: ${name}`);
			})
			.catch(err => {
				console.log('An error occurred: ', err);
			});
		mainWindow.webContents.openDevTools();
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();

		ipcMain.on('open-external-window', (event, arg) => {
			shell.openExternal(arg);
		});
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})

	mainWindow.on('minimize', (event) => {
		event.preventDefault()
		mainWindow.hide()
	})

};

generateMenu = () => {
	const template = [
		{
			label: 'File',
			submenu: [{ role: 'about' }, { role: 'quit' }],
		},
		{
			label: 'Edit',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				{ role: 'pasteandmatchstyle' },
				{ role: 'delete' },
				{ role: 'selectall' },
			],
		},
		{
			label: 'View',
			submenu: [
				{ role: 'reload' },
				{ role: 'forcereload' },
				{ role: 'toggledevtools' },
				{ type: 'separator' },
				{ role: 'resetzoom' },
				{ role: 'zoomin' },
				{ role: 'zoomout' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
			],
		},
		{
			role: 'window',
			submenu: [{ role: 'minimize' }, { role: 'close' }],
		},
		{
			role: 'help',
			submenu: [
				{
					click() {
						require('electron').shell.openExternal(
							'https://github.com/talhahavadar/copycat',
						);
					},
					label: 'Learn More',
				},
				{
					click() {
						require('electron').shell.openExternal(
							'https://github.com/talhahavadar/copycat/issues',
						);
					},
					label: 'File Issue on GitHub',
				},
			],
		},
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

generateTray = () => {
	tray = new Tray(path.join(__dirname, '/assets/icons/32x32.png'))
	var contextMenu = Menu.buildFromTemplate([
		{
			label: 'Show App', click: () => {
				if (mainWindow != null)
					mainWindow.show()
				else
					createWindow()
			}
		},
		{
			label: 'Quit', click: () => {
				app.isQuiting = true;
				app.quit();
			}
		}
	]);
	tray.setToolTip("Copycat - A Shared Clipboard")
	tray.setContextMenu(contextMenu)
	tray.on('double-click', (event, bounds) => {
		if (mainWindow != null)
			mainWindow.show()
		else
			createWindow()
	})
}

ipcMain.on('load-page', (event, arg) => {
	mainWindow.loadURL(arg);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	let sense = new CopycatSwarm();
	let clipboardManager = new ClipboardManager();
	var lastDataFromRemote = undefined
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
	})

	ipcMain.on('getDevices', (event, arg) => {
		let devices = []
		for (const id in sense.peers) {
			if (sense.peers.hasOwnProperty(id)) {
				const peer = sense.peers[id];
				let device = {
					id: peer.connectionId,
					name: peer.name,
					ip_addr: `${peer.info.host}:${peer.info.port}`
				}
				devices.push(device)
			}
		}
		event.returnValue = devices
	})

	createWindow();
	generateMenu();
	generateTray();
})

app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	// if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
