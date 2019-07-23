<template>
  <div class="q-pa-md" style="width: 100%">
    <q-list>
      <DeviceListItem v-for="device in devices" :key="device.id" :device="device" />
    </q-list>
  </div>
</template>

<style scoped>
</style>

<script>
import DeviceListItem from "./devicelistItem";

export default {
  name: "DeviceList",
  components: {
    DeviceListItem
  },
  data() {
    return {
      copyCatLogoSrc: "statics/copycat-logo.png",
      devices: [
        {
          id: 1,
          name: "Lisbon",
          ip_addr: `192.168.1.6:6666`,
          disabled: true
        },
        {
          id: 2,
          name: "Berlin",
          ip_addr: `192.168.1.8:6666`,
          disabled: false
        }
      ]
    }
  }
};
</script>
