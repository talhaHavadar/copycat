<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="text-black">
      <q-toolbar>
        <q-avatar size="24px">
          <img :src="copyCatLogoSrc" />
        </q-avatar>

        <q-toolbar-title class="text-center">
          Discovered Devices
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "MyLayout",
  data() {
    return { copyCatLogoSrc: "statics/copycat-logo.png" };
  }
};
</script>

<style></style>
