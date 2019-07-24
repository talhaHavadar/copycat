<template>
  <div class="q-pa-md" style="width: 100%">
    <q-list>
      <DeviceListItem
        v-for="device in devices"
        :key="device.id"
        :device="device"
      />
    </q-list>
  </div>
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
  mounted: function () {
    this.$nextTick(function () {
      this.refreshDevices();
      if(this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.on("new-device-connected", () => {
          this.refreshDevices();
        });
      }
    })
  }
};
</script>
