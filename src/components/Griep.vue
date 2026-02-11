<template>
  <v-row>
    <v-col cols="12">
      <h3>Griep en andere ziektes</h3>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Incidentie griepachtig ziektebeeld</v-card-title>
        <v-card-text><BaseChart :option="chartGriepOption" /></v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import VChart from "vue-echarts";
import * as echarts from "echarts";
import BaseChart from "./BaseChart.vue";

import { useGriepData } from "@/composables/useGriepData";
import { getCurrentISOWeek } from "@/helpers/weeknum";
import { useAutoRefresh } from "@/composables/useAutorefresh";
const { weeks, series, fetchGriepData, loading, error } = useGriepData();

useAutoRefresh(fetchGriepData, 2 * 60 * 60); // refresh every 2 hours

const selectedYears = ["2024/2025", "2025/2026"];

const currentWeek = `wk ${getCurrentISOWeek()}`;

const chartGriepOption = computed(() => ({
  tooltip: {
    trigger: "axis",
  },
  legend: {
    show: true,
    data: series.value.map((s) => s.name),
    selected: Object.fromEntries(
      series.value.map((s) => [s.name, selectedYears.includes(s.name)]),
    ),
  },
  xAxis: { type: "category", data: weeks.value },
  yAxis: { type: "value", name: "Incidentie per 100.000 inwoners" },
  series: series.value.map((s) => {
    if (s.name === "2025/2026") {
      return {
        ...s,
        showSymbol: false,
        markLine: {
          symbol: "none",
          label: {
            formatter: "Huidige week",
            position: "insideEndTop",
          },
          lineStyle: {
            type: "dashed",
            width: 1,
            color: "grey",
          },
          data: [
            {
              xAxis: currentWeek,
            },
          ],
        },
      };
    }
    return {
      ...s,
      showSymbol: false,
    };
  }),
}));
</script>
