let menuExports = {
  init
};

import electron from "electron";

let menu;
let app = electron.app;

function init() {
  menu = electron.Menu.buildFromTemplate(getMenuTemplate());
  electron.Menu.setApplicationMenu(menu);
}

function getMenuTemplate() {
  const template = [
    {
      label: "File",
      submenu: [
        { role: "about" },
        {
          label: "Quit",
          click() {
            app.isQuitting = true;
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
            electron.shell.openExternal(
              "https://github.com/talhahavadar/copycat"
            );
          },
          label: "Learn More"
        },
        {
          click() {
            electron.shell.openExternal(
              "https://github.com/talhahavadar/copycat/issues"
            );
          },
          label: "File Issue on GitHub"
        }
      ]
    }
  ];
  return template;
}

export default menuExports;
