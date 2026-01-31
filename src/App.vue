<script setup lang="ts">
import DegreeDays from "./components/DegreeDays.vue";
import EnergieProductie from "./components/EnergieProductie.vue";
import DynamischePrijzen from "./components/DynamischePrijzen.vue";
import Waterhoogte from "./components/Waterhoogte.vue";
import Weer from "./components/Weer.vue";
import Droogte from "./components/Droogte.vue";
import Luchtkwaliteit from "./components/Luchtkwaliteit.vue";
import Griep from "./components/Griep.vue";

import { useTheme, useDisplay } from "vuetify";
import { onMounted, ref, watchEffect } from "vue";

const theme = useTheme();

function toggleDark() {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
}

const sections = [
  { id: "weer", title: "Weer" },
  { id: "degree-days", title: "Voorspelling gasverbruik" },
  { id: "energie-productie", title: "Energie productie" },
  { id: "dynamische-prijzen", title: "Dynamische prijzen" },
  { id: "waterhoogte", title: "Waterhoogte" },
  { id: "droogte", title: "Droogte" },
  { id: "luchtkwaliteit", title: "Luchtkwaliteit" },
  { id: "griep", title: "Griep en andere ziektes" },
];

const { smAndDown } = useDisplay(); // reactive breakpoint
const drawer = ref(!smAndDown.value); // desktop open, mobile closed
watchEffect(() => {
  drawer.value = !smAndDown.value;
});

const activeId = ref<string | null>(null);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) activeId.value = e.target.id;
      });
    },
    {
      rootMargin: "-64px 0px -60% 0px", // app-bar offset
      threshold: 0,
    },
  );

  document
    .querySelectorAll(".scroll-section")
    .forEach((el) => observer.observe(el));
});
</script>

<template>
  <v-app>
    <v-app-bar color="primary"
      ><v-app-bar-title> Dashboard </v-app-bar-title>
      <v-spacer />
      <v-btn icon="mdi-theme-light-dark" @click="toggleDark" />
      <v-btn icon v-if="smAndDown" @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer
      app
      v-model="drawer"
      :temporary="smAndDown"
      width="180"
    >
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in sections"
          :key="item.id"
          :href="`#${item.id}`"
          :active="item.id === activeId"
          @click="drawer = !smAndDown ? true : false"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <section id="weer" class="scroll-section">
          <Weer />
        </section>
        <section id="degree-days" class="scroll-section">
          <DegreeDays />
        </section>
        <section id="energie-productie" class="scroll-section">
          <EnergieProductie />
        </section>
        <section id="dynamische-prijzen" class="scroll-section">
          <DynamischePrijzen />
        </section>
        <section id="waterhoogte" class="scroll-section">
          <Waterhoogte />
        </section>
        <section id="droogte" class="scroll-section">
          <Droogte />
        </section>
        <section id="luchtkwaliteit" class="scroll-section">
          <Luchtkwaliteit />
        </section>
        <section id="griep" class="scroll-section">
          <Griep />
        </section>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
html {
  scroll-behavior: smooth;
}
.scroll-section {
  scroll-margin-top: 64px;
}
</style>
