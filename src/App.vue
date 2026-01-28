<script setup lang="ts">
import DegreeDays from "./components/DegreeDays.vue";
import EnergieProductie from "./components/EnergieProductie.vue";
import DynamischePrijzen from "./components/DynamischePrijzen.vue";
import Waterhoogte from "./components/Waterhoogte.vue";
import Weer from "./components/Weer.vue";
import Droogte from "./components/Droogte.vue";
import Luchtkwaliteit from "./components/Luchtkwaliteit.vue";
import Griep from "./components/Griep.vue";

import { useTheme } from "vuetify";
import { watch } from "vue";

const theme = useTheme();

function toggleDark() {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
}

// watch(
//   () => theme.global.name.value,
//   val => localStorage.setItem('theme', val)
// );
</script>

<template>
  <v-app>
    <v-app-bar color="primary"
      ><v-app-bar-title> Dashboard </v-app-bar-title>
      <v-spacer />
      <v-btn icon="mdi-theme-light-dark" @click="toggleDark" />
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <Weer />
        <DegreeDays />
        <EnergieProductie />
        <DynamischePrijzen />
        <Waterhoogte />
        <Droogte />
        <!-- <Luchtkwaliteit /> -->
        <Griep />
      </v-container>
    </v-main>
  </v-app>
</template>
