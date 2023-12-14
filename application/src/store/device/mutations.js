import { Platform } from "quasar";

export function refreshDevices(state) {
  if (Platform.is.electron) {
    state.devices = window.ipcRenderer.sendSync("getDevices");
    console.log("refreshDevices", state.devices);
  }
}
export function updateDevice(state, { id, currentState }) {
  if (Platform.is.electron) {
    window.ipcRenderer.send("updateDevice", {
      id: id,
      disabled: !currentState
    });
  }
}
