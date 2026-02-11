<template>
  <v-row>
    <v-col cols="12">
      <h3>Luchtvervuiling</h3>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title
          >Huidige luchtkwaliteitsindex ({{ selectedFormula }})</v-card-title
        >
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
                :fill-color="
                  limitsByRating[station.latest_rating]?.color || 'lightgrey'
                "
                :fill-opacity="0.8"
                :color="'rgba(0,0,0,0.5)'"
                :weight="1"
                @click="selectedStationId = station.id"
              >
                <l-tooltip direction="top" :offset="[0, -6]" :opacity="0.9">
                  <b>{{ station.display_name }}</b
                  >: ({{ station.latest_value }},
                  {{ station.latest_rating }})<br />Station id:
                  {{ station.number }}
                </l-tooltip>
              </l-circle-marker>
            </l-map>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title
          >Gemeten {{ selectedFormula }} afgelopen 7 dagen in
          {{ stationsById[selectedStationId]?.display_name }}</v-card-title
        >
        <v-card-text>
          <v-select
            v-model="selectedFormula"
            :items="formulas"
            label="Stof"
            density="compact"
            hide-details /><BaseChart
            :option="chartMeasurementsForStationOption"
        /></v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from "vue";
import VChart from "vue-echarts";
import * as echarts from "echarts";
import BaseChart from "./BaseChart.vue";
import {
  LMap,
  LTileLayer,
  LCircleMarker,
  LPopup,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import { useLuchtmeetnet } from "@/composables/useLuchtmeetnet";
import { getLkiStyle } from "@/constants/luchtkwaliteitkleuren";
import { useAutoRefresh } from "@/composables/useAutoRefresh";

const {
  stationsById,
  measurements,
  measurementsForStation,
  componentLimits,
  fetchStations,
  fetchMeasurements,
  fetchMeasurementsForStation,
  fetchComponentLimits,
  getStationsWithLatestValue,
} = useLuchtmeetnet();

const selectedStationId = ref("1ad4a380-b77e-4c28-9618-8e4f2ec39153");
const selectedFormula = ref<"NO2" | "NO" | "PM25" | "PM10">("PM25");

const formulas = [
  { title: "NO₂", value: "NO2" },
  { title: "NO", value: "NO" },
  { title: "PM2.5", value: "PM25" },
  { title: "PM10", value: "PM10" },
];

interface Limit {
  rating: number;
  lowerband: number | null;
  upperband: number;
  color: string;
  type: string;
}
const limitsByRating = computed<Record<number, Limit>>(() => {
  if (!componentLimits.value) return {};
  const map: Record<number, Limit> = {};

  for (const limit of componentLimits.value.limits) {
    const newcolor = getLkiStyle(limit.rating).plot_color;
    limit.color = newcolor;
    map[limit.rating] = limit;
  }

  return map;
});
const bands = computed(() =>
  Object.values(limitsByRating.value).map((l) => ({
    itemStyle: { color: getLkiStyle(l.rating).plot_color },
    label: { show: false },
    data: [[{ yAxis: l.lowerband ?? 0 }, { yAxis: l.upperband }]],
  })),
);

const bandSeries = computed(() =>
  bands.value.map((b) => ({
    type: "line",
    silent: true,
    data: [],
    markArea: {
      silent: true,
      ...b,
    },
  })),
);

const now = new Date();
const twoHourAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

async function fetchAll() {
  await fetchStations();
  await fetchMeasurements(
    twoHourAgo.toISOString(),
    now.toISOString(),
    selectedFormula.value,
  );
  await fetchComponentLimits(selectedFormula.value);
}

useAutoRefresh(fetchAll, 30 * 60); // refresh every 30 minutes

watch(selectedFormula, async (formula) => {
  await fetchMeasurements(twoHourAgo.toISOString(), now.toISOString(), formula);
  await fetchComponentLimits(formula);
});

watch(
  [selectedStationId, selectedFormula],
  async ([newStationId, newFormula]) => {
    if (!newStationId) return;

    await fetchMeasurementsForStation(
      newStationId,
      sevenDaysAgo.toISOString(),
      now.toISOString(),
      newFormula,
    );
  },
  { immediate: true },
);

const stationsWithValues = computed(() => getStationsWithLatestValue());

const chartMeasurementsForStationOption = computed(() => ({
  tooltip: {
    trigger: "axis",
  },
  xAxis: {
    type: "time",
  },
  yAxis: {
    type: "value",
  },
  series: [
    ...bandSeries.value,
    {
      name: "Luchtkwaliteitsindex",
      type: "line",
      data: measurementsForStation.value
        .filter((m) => m.value >= 0)
        .map((m) => [m.timestamp_measured, m.value]),
      smooth: true,
      showSymbol: false,
    },
  ],
}));
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
