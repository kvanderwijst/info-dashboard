<template>
  <v-row>
    <v-col cols="12">
      <h3>Waterhoogte</h3>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-text>
          <iframe
            src="https://waterinfo.rws.nl/embed/publiek/waterhoogte/doesburg.ijssel/details?weergave=grafiek&view=map"
          ></iframe>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-text>
          <iframe src="https://v14.rws.nl/lobith/waterafvoer#iframe"></iframe>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts"></script>

<style scoped>
iframe {
  width: 100%;
  height: 500px;
  border: none;
}
</style>
