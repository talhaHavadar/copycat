<template>
  <q-list>
    <DeviceListItem
      v-for="device in devices"
      :key="device.id"
      :device="device"
    />
  </q-list>
</template>

<style scoped></style>

<script>
import { mapActions, mapGetters } from "vuex";
import DeviceListItem from "./devicelistItem";

export default {
  name: "DeviceList",
  components: {
    DeviceListItem
  },
  data() {
    return {
      copyCatLogoSrc: "statics/copycat-logo.png"
    };
  },
  computed: {
    ...mapGetters("device", ["devices"])
  },
  methods: {
    ...mapActions("device", ["refreshDevices"])
  },
  mounted: function() {
    this.$nextTick(function() {
      this.refreshDevices();
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.on("device-list-updated", () => {
          this.refreshDevices();
        });
      }
    });
  }
};
</script>
