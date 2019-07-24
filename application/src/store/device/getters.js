/*
export function someGetter (state) {
}
*/

export function devices(state) {
  return state.devices.filter(device => device.name);
}
