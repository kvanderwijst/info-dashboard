<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Huidige luchtkwaliteitsindex</v-card-title>
        <v-card-text>
          <div>
            <l-map
              class="clean-map"
              style="height: 600px; width: 100%"
              :zoom="7"
              :center="[52.2, 5.3]"
            >
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <l-circle-marker
                v-for="station in stationsWithValues"
                :key="station.id"
                :lat-lng="[
                  station.geometry.latitude,
                  station.geometry.longitude,
                ]"
                :radius="8"
                :fill-color="getColorAndName(station.latest_value)[0]"
                :fill-opacity="0.8"
                :color="'rgba(0,0,0,0.5)'"
                :weight="1"
              >
                <l-tooltip direction="top" :offset="[0, -6]" :opacity="0.9">
                  <b>{{ station.display_name }}</b
                  >: {{ getColorAndName(station.latest_value)[1] }} ({{
                    station.latest_value
                  }})
                </l-tooltip>
              </l-circle-marker>
            </l-map>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import {
  LMap,
  LTileLayer,
  LCircleMarker,
  LPopup,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import { useLuchtmeetnet } from "@/composables/useLuchtmeetnet";

const { fetchStations, fetchMeasurements, getStationsWithLatestValue } =
  useLuchtmeetnet();

const now = new Date();
const twoHourAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

function getColorAndName(value: number | null) {
  switch (value) {
    case 0:
      return ["rgb(42,99,246)", "Goed"];
    case 1:
      return ["rgb(42,99,246)", "Goed"];
    case 2:
      return ["rgb(78,173,249)", "Goed"];
    case 3:
      return ["rgb(161,199,250)", "Goed"];
    case 4:
      return ["rgb(255,255,206)", "Matig"];
    case 5:
      return ["rgb(255,255,163)", "Matig"];
    case 6:
      return ["rgb(255,255,85)", "Matig"];
    case 7:
      return ["rgb(247,202,69)", "Onvoldoende"];
    case 8:
      return ["rgb(241,155,56)", "Onvoldoende"];
    case 9:
      return ["rgb(236,90,41)", "Slecht"];
    case 10:
      return ["rgb(234,58,36)", "Slecht"];
    case 11:
      return ["rgb(152,65,210)", "Zeer slecht"];
    default:
      return ["#95a5a6", "Geen data"];
  }
}

onMounted(async () => {
  await fetchStations();
  await fetchMeasurements(twoHourAgo.toISOString(), now.toISOString());
});

const stationsWithValues = computed(() => getStationsWithLatestValue());
</script>

<style scoped>
:deep(.leaflet-container) {
  background: white;
}
:deep(.leaflet-tile-container) {
  filter: grayscale(50%) brightness(1.05) contrast(0.95);
  opacity: 0.65;
}
</style>
