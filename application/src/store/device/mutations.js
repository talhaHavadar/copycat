import { Platform } from "quasar";

export function refreshDevices(state) {
  if (Platform.is.electron) {
    state.devices = window.ipcRenderer.sendSync("getDevices");
  }
}
export function updateDevice(state, id) {
  console.log("mutations, UPDATE_DEVICE", state, id);
}
