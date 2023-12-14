<template>
  <q-page class="scroll">
    <DeviceList />
  </q-page>
</template>

<style></style>

<script>
import DeviceList from "../components/devicelist";

export default {
  name: "PageIndex",
  components: {
    DeviceList
  }
};
</script>
