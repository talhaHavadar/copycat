export async function updateDevice(context, payload) {
  context.commit("updateDevice", payload);
  await context.dispatch("refreshDevices");
}

export async function refreshDevices(context) {
  context.commit("refreshDevices");
}
