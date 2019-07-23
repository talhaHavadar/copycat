import { Platform } from "quasar";

export function refreshDevices(state) {
        console.log("REFRESH_DEVICES", state);
        if (Platform.is.electron) {
            // TODO: use ipcRenderer to fetch devices.
        }
    };
export function updateDevice(state, id) {
    console.log("mutations, UPDATE_DEVICE", state, id);
};
