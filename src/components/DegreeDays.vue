<template>
  <v-row>
    <v-col cols="12">
      <h3>Heating degree days en gasvoorspellingen</h3>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title
          >Relatie tussen dagtemperatuur (HDD) en gasverbruik
        </v-card-title>
        <v-card-text>
          <div class="slider-container">
            HDD (Heating Degree Days) is berekend als {{ baseTempHDD }}°C –
            (gemiddelde temperatuur per dag).
          </div>
          <BaseChart :option="optionCorrelationHDD" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title
          >Voorspeld gasverbruik a.d.h.v. dagtemperatuur (HDD)
        </v-card-title>
        <v-card-text>
          <div class="slider-container">
            <div class="slider-row">
              <label>
                Gas per HDD: {{ gasConsumptionPerHDD.toFixed(3) }} m³
              </label>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.01"
                v-model.number="gasConsumptionPerHDD"
              />
            </div>
            <div class="slider-row">
              <label> Aantal dagen terug: {{ daysBack.toFixed(0) }} </label>
              <input
                type="range"
                min="0"
                max="75"
                step="1"
                v-model.number="daysBack"
              />
            </div>
          </div>
          <BaseChart :option="optionHDD" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import VChart from "vue-echarts";
import * as echarts from "echarts";
import BaseChart from "./BaseChart.vue";

import { useOpenMeteo } from "@/composables/useOpenMeteo";
import { gasverbruik } from "@/data/gasverbruik";

const handleOpenMeteo = useOpenMeteo();
const gasConsumptionPerHDD = ref(0.458);
const daysBack = ref(21);
const baseTempHDD = 15.5;

function fetchWeather() {
  handleOpenMeteo.fetchData(
    "52.0512",
    "6.103",
    "temperature_2m_mean",
    "temperature_2m",
    daysBack.value.toString(),
    "3",
  );
}

onMounted(() => {
  const today = new Date();
  today.setHours(1, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(0, 0, 0, 0);

  fetchWeather();
});

let timeout: number | undefined;
watch(daysBack, (newValue, oldValue) => {
  clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    fetchWeather();
  }, 300);
});

function predictGas(temp: number, gasPerHDD: number) {
  const heating_degree_days = Math.max(0, baseTempHDD - temp);
  return heating_degree_days * gasPerHDD;
}

const today = new Date().toISOString().slice(0, 10);

const optionHDD = computed(() => ({
  xAxis: { type: "time" },
  yAxis: {
    type: "value",
    axisLabel: {
      formatter: (value: number) => `${value} m³`,
    },
  },
  tooltip: {
    trigger: "axis",
    valueFormatter: (value: number) => `${value.toFixed(1)} m³`,
  },
  legend: {
    show: true,
  },
  series: [
    {
      type: "bar",
      name: "Voorspeld gasverbruik",
      //   showSymbol: false,
      data: handleOpenMeteo.dataDaily.value["time"]?.map(
        (time: string, index: number) => {
          const value = predictGas(
            handleOpenMeteo.dataDaily.value["temperature_2m_mean"][index],
            gasConsumptionPerHDD.value,
          );

          const isPrediction = time >= today;
          const isToday = time === today;

          return {
            value: [time, value],
            label: {
              show: isToday,
              position: "top",
              formatter: `{b}Voorspeld voor\nvandaag:\n${value.toFixed(1)} m³`,
            },
            itemStyle: {
              color: isPrediction
                ? isToday
                  ? "crimson"
                  : "orange" // future / prediction
                : "#1976d2", // past / measured
            },
          };
        },
      ),
    },
    {
      name: "Daadwerkelijke gasverbruik",
      type: "line",
      showSymbol: false,
      data: gasverbruik.filter(
        (value) => value[0] >= handleOpenMeteo.dataDaily.value?.time?.[0],
      ),
    },
  ],
}));

const scatterData = computed(() => {
  if (!handleOpenMeteo.dataDaily.value) return [];

  const actualByDate = new Map(gasverbruik as [string, number][]);

  return handleOpenMeteo.dataDaily.value.time
    ?.map((date: string, index: number) => [
      date,
      predictGas(handleOpenMeteo.dataDaily.value.temperature_2m_mean[index], 1),
    ])
    .filter(([date]: [string, number]) => actualByDate.has(date))
    .map(([date, predicted]: [string, number]) => ({
      hdd: predicted,
      actual: actualByDate.get(date)!,
      date,
    }));
});

const optionCorrelationHDD = computed(() => ({
  tooltip: {
    trigger: "item",
    formatter: (params: any) => {
      const [x, y] = params.value;
      const date = params.data.date;
      return `
        <b>${date}</b><br/>
        HDD: ${x.toFixed(2)}<br/>
        Gasverbruik: ${y.toFixed(2)}
        `;
    },
  },
  xAxis: {
    type: "value",
    name: "HDD",
  },
  yAxis: {
    type: "value",
    name: "Gasverbruik (m³)",
  },
  series: [
    {
      type: "scatter",
      data: scatterData.value?.map(
        (point: { hdd: any; actual: any; date: any }) => ({
          value: [point.hdd, point.actual],
          date: point.date,
        }),
      ),
    },
    {
      type: "line",
      showSymbol: false,
      data: [
        [0, 0],
        [21, 21 * gasConsumptionPerHDD.value],
      ],
    },
  ],
}));
</script>

<style scoped>
.chart {
  width: 100%;
  height: 350px;
}
.slider-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  height: 50px;
}
.slider-row {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}
</style>
