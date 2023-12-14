const { contextBridge, ipcRenderer } = require('electron')

// TODO: do not expose the send methods of ipcRenderer
contextBridge.exposeInMainWorld("ipcRenderer", {
    sendSync(channel) {
        return ipcRenderer.sendSync(channel)
    },
    send(channel, data) {
        return ipcRenderer.send(channel, data)
    }
})
