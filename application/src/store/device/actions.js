
export async function updateDevice(context, {id}) {
    console.log("Action", "UPDATE_DEVICE", context, id);
    context.commit("updateDevice", id)
};

export function refreshDevices(context) {
    console.log("Action", "REFRESH_DEVICES", context);
};
