<template>
  <q-item
    clickable
    v-ripple
    class="device-list-item gradient-border"
    @click="updateDevice({ id: 111 })"
  >
    <q-item-section avatar>
      <q-avatar>
        <img :src="copyCatLogoSrc" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label class="name">{{ device.name }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-item-label class="ip">{{ device.ip_addr }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<style scoped>
.device-list-item {
  font-size: 16px;
  font-weight: lighter;
  margin-bottom: 2px;
}

.name {
  margin-left: 1rem;
  font-weight: 500;
}

.ip {
  font-weight: normal;
}

.gradient-border {
  --borderWidth: 1px;
  background: #e7e7e7;
  position: relative;
}

.gradient-border:after {
  content: "";
  position: absolute;
  top: calc(var(--borderWidth));
  left: calc(1 * var(--borderWidth));
  height: calc(100% + var(--borderWidth));
  width: calc(100% - var(--borderWidth));
  background: linear-gradient(
    60deg,
    #f79533,
    #f37055,
    #ef4e7b,
    #a166ab,
    #5073b8,
    #1098ad,
    #07b39b,
    #6fba82
  );
  z-index: -1;
  animation: animatedgradient 3s ease alternate infinite;
  background-size: 200% 200%;
}

@keyframes animatedgradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>

<script>
import { mapActions } from "vuex";

export default {
  name: "DeviceListItem",
  props: ["device"],
  data() {
    return {
      copyCatLogoSrc: "statics/copycat-logo.png"
    };
  },
  methods: {
    ...mapActions("device", ["updateDevice"])
  }
};
</script>
