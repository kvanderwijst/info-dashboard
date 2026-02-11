<template>
  <v-row>
    <v-col cols="12">
      <h3>Dynamische prijzen</h3>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Elektriciteitsprijzen vandaag en morgen</v-card-title>
        <v-card-text>
          <BaseChart :option="optionElectricity" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Gasprijzen afgelopen jaar</v-card-title>
        <v-card-text>
          <BaseChart :option="optionGas" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import VChart from "vue-echarts";
import * as echarts from "echarts";
import BaseChart from "./BaseChart.vue";
import type { Ref } from "vue";

import { useEnergyPrices } from "@/composables/useEnergyPrices";
import { useAutoRefresh } from "@/composables/useAutoRefresh";

const electricityPrices = useEnergyPrices();
const gasPrices = useEnergyPrices();

function fetchAll() {
  const today = new Date();
  today.setHours(1, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(0, 0, 0, 0);

  electricityPrices.fetchPrices(
    "electricity",
    "HOUR",
    today.toISOString(),
    tomorrow.toISOString(),
  );

  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  gasPrices.fetchPrices(
    "gas",
    "DAY",
    oneYearAgo.toISOString(),
    tomorrow.toISOString(),
  );
}

useAutoRefresh(fetchAll, 30 * 60); // refresh every 30 minutes

const now = new Date().getTime();

const markLine = {
  symbol: "none",
  animation: false,
  data: [
    {
      xAxis: now,
      label: { formatter: "Now" },
      lineStyle: { color: "grey", width: 1 },
    },
  ],
};

const euroFormatter = (value: number) => `€ ${value}`;

const basePriceChart = {
  xAxis: { type: "time" },
  yAxis: {
    type: "value",
    axisLabel: {
      formatter: euroFormatter,
    },
  },
  tooltip: {
    trigger: "axis",
    valueFormatter: euroFormatter,
  },
  legend: {
    show: true,
    data: ["Marktprijs", "All-in prijs"],
    selectedMode: "single",
  },
};
function createPriceSeries(
  prices: Ref<{ date: string; marktprijs: number; allInPrijs: number }[]>,
  markLine?: any,
) {
  return [
    {
      name: "Marktprijs",
      type: "line",
      showSymbol: false,
      step: "start",
      data: prices.value.map((d) => [d.date, d.marktprijs]),
      ...(markLine && { markLine }),
    },
    {
      name: "All-in prijs",
      type: "line",
      showSymbol: false,
      step: "start",
      data: prices.value.map((d) => [d.date, d.allInPrijs]),
      ...(markLine && { markLine }),
    },
  ];
}

const optionElectricity = computed(() => ({
  ...basePriceChart,
  series: createPriceSeries(electricityPrices.data, markLine),
}));

const optionGas = computed(() => ({
  ...basePriceChart,
  series: createPriceSeries(gasPrices.data),
}));
</script>

<style scoped>
.chart {
  width: 100%;
  height: 350px;
}
</style>
