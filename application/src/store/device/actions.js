export async function updateDevice(context, { id }) {
  context.commit("updateDevice", id);
}

export function refreshDevices(context) {
  context.commit("refreshDevices");
}
