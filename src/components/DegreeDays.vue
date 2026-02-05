<template>
  <v-row>
    <v-col cols="12">
      <h3>Heating degree days en gasvoorspellingen</h3>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" sm="4">
      <v-card>
        <v-card-title>Voorspelling gasverbruik vandaag</v-card-title>
        <v-card-text>
          <div class="voorspelling-vandaag">
            <div class="center">
              <p class="voorspelling-main">
                {{ gasForDay(0)?.toFixed(1) ?? "N/A" }} m³
              </p>

              <p
                v-if="gasChangePct !== null"
                :key="gasChangePct"
                class="voorspelling-extra"
              >
                (<span :class="gasChangePct > 0 ? 'text-red' : 'text-green'"
                  >{{ gasChangePct > 0 ? "+" : ""
                  }}{{ gasChangePct.toFixed(0) }}%
                </span>
                t.o.v. gisteren)
              </p>
            </div>
          </div>
        </v-card-text></v-card
      >
    </v-col>
    <v-col cols="12" sm="4">
      <v-card>
        <v-card-title>Huidig gasverbruik van vandaag</v-card-title>
        <v-card-text>
          <div v-if="loading">Loading…</div>
          <div v-else class="gauge-chart">
            <BaseChart :option="optionUsageGauge" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
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

import { useHomewizardGas } from "@/composables/useHomewizard";
import { useOpenMeteo } from "@/composables/useOpenMeteo";
import { gasverbruik } from "@/data/gasverbruik";

const handleOpenMeteo = useOpenMeteo();
const gasConsumptionPerHDD = ref(0.458);
const daysBack = ref(21);
const baseTempHDD = 15.5;

const { gasUsage, loading, error, fetchGas } = useHomewizardGas();

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

function dateFromToday(offset: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

onMounted(() => {
  const today = new Date();
  today.setHours(1, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(0, 0, 0, 0);

  fetchWeather();
  fetchGas();
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

type DailyGasValue = {
  time: string;
  value: number;
};

const dailyGasValues = computed<DailyGasValue[]>(() => {
  const daily = handleOpenMeteo.dataDaily.value;
  if (!daily?.time) return [];

  return daily.time.map((time: string, index: number) => ({
    time,
    value: predictGas(
      daily.temperature_2m_mean[index],
      gasConsumptionPerHDD.value,
    ),
  }));
});

const gasByDate = computed<Record<string, number>>(() =>
  Object.fromEntries(dailyGasValues.value.map((d) => [d.time, d.value])),
);

function gasForDay(offset: number): number | null {
  return gasByDate.value[dateFromToday(offset)] ?? null;
}

function percentChange(
  day1: number | null,
  day0: number | null,
): number | null {
  if (day1 === null || day0 === null || day0 === 0) {
    return null;
  }
  return ((day1 - day0) / day0) * 100;
}

const gasChangePct = computed(() => percentChange(gasForDay(0), gasForDay(-1)));

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
      data: dailyGasValues.value.map(({ time, value }) => {
        const offset =
          (new Date(time).getTime() - new Date(today).getTime()) /
          (1000 * 60 * 60 * 24);

        const isToday = offset === 0;

        return {
          value: [time, value],
          label: {
            show: isToday,
            position: "top",
            formatter: `Voorspeld voor\nvandaag:\n${value.toFixed(1)} m³`,
          },
          itemStyle: {
            color: offset > 0 ? "orange" : offset === 0 ? "crimson" : "#1976d2",
          },
        };
      }),
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

const actual = computed(() => gasUsage.value ?? 0);
const percentage = computed(() => (actual.value / (gasForDay(0) ?? NaN)) * 100);

const optionUsageGauge = computed(() => ({
  series: [
    {
      type: "gauge",
      min: 0,
      max: 100,

      radius: "100%",
      center: ["50%", "60%"],

      progress: {
        show: true,
        width: 12,
        itemStyle: {
          color: percentage.value > 100 ? "#B6342B" : "rgb(50, 102, 186)",
        },
      },

      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },

      pointer: { show: false },

      title: {
        offsetCenter: [0, "60%"],
        fontSize: 14,
        show: false,
      },

      detail: {
        offsetCenter: [0, "0%"],
        fontSize: 30,
        fontWeight: "bold",
        formatter: (value: number) =>
          `{value|${Math.round(value)}%}\n{name|Verbruik: ${actual.value.toFixed(1)} m³ \n Voorspeld: ${gasForDay(0)?.toFixed(1)} m³}`,
        rich: {
          value: {
            fontSize: 32,
            fontWeight: "bold",
            lineHeight: 36,
            color: percentage.value > 100 ? "#B6342B" : "rgb(50, 102, 186)",
          },
          name: {
            fontSize: 14,
            color: "#888",
            lineHeight: 20,
          },
        },
      },

      data: [
        {
          value: percentage.value,
        },
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
.gauge-chart {
  .chart {
    height: 180px;
  }
}

.voorspelling-vandaag {
  height: 180px;
  text-align: center;
  font-size: 1.3em;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-family: sans-serif;

  .voorspelling-main {
    font-size: 32px;
    color: rgb(50, 102, 186);
  }

  .voorspelling-extra {
    font-size: 14px;
    color: rgb(136, 136, 136);
  }
}
</style>
