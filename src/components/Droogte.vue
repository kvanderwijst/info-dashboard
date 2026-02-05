<template>
  <v-row>
    <v-col cols="12">
      <h3>Droogte</h3>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-text>
          <img
            class="neerslagtekort"
            src="https://cdn.knmi.nl/knmi/map/page/klimatologie/grafieken/neerslagtekort/neerslagtekort.png"
          />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Grondwaterstanden</v-card-title>
        <v-card-text>
          <iframe
            src="https://droogteportaal.nl/droogteportaal/web/embedded_map.html?index=sgi_0&index_type=current&max_screen_depth=10"
            width="100%"
            height="435"
            frameborder="0"
          ></iframe>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.neerslagtekort {
  width: 100%;
  height: auto;
}
</style>
