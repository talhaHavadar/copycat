const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld("ipcRenderer", {
    sendSync(channel) {
        return ipcRenderer.sendSync(channel)
    },
    send(channel, data) {
        return ipcRenderer.send(channel, data)
    }
})
