<template>
  <v-row>
    <v-col cols="12">
      <h3>Energieproductie en -verbruik in Nederland</h3>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Energieproductie gisteren en vandaag</v-card-title>
        <v-card-text>
          <BaseChart :option="chartOption" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title
          >Gasverbruik door huishoudens afgelopen maand</v-card-title
        >
        <v-card-text>
          <BaseChart :option="chartGasConsumptionOption" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import VChart from "vue-echarts";
import BaseChart from "./BaseChart.vue";
import { useNedData } from "@/composables/useNedData";
import {
  NedDataType,
  NedGranularity,
  NedForecastClassification,
  NedActivity,
} from "@/constants/ned";
import { useAutoRefresh } from "@/composables/useAutoRefresh";

const SERIES = [
  {
    key: "nuclear",
    label: "Kernenergie",
    type: NedDataType.PRODUCTION_NUCLEAR,
  },
  {
    key: "coal",
    label: "Kolen",
    type: NedDataType.PRODUCTION_COAL,
  },
  {
    key: "gas",
    label: "Gas",
    type: NedDataType.PRODUCTION_GAS,
  },
  {
    key: "wind",
    label: "Wind (onshore)",
    type: NedDataType.PRODUCTION_WIND_LAND,
  },
  {
    key: "wind",
    label: "Wind (op zee)",
    type: NedDataType.PRODUCTION_WIND_OFFSHORE,
  },
  {
    key: "solar",
    label: "Zon",
    type: NedDataType.PRODUCTION_SOLAR,
  },
  {
    key: "demand",
    label: "Totaal verbruik",
    type: NedDataType.CONSUMPTION_ELECTRICITY,
  },
  {
    key: "total",
    label: "Totaal productie",
    type: NedDataType.PRODUCTION_TOTAL,
  },
];

const { seriesData, loading, error, fetchMultipleSeries } = useNedData();
const gasConsumptionHandler = useNedData();

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function formatedOffsetDay(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return formatDate(date);
}

function fetchAll() {
  fetchMultipleSeries(
    SERIES.map((s) => ({
      key: s.key,
      params: {
        type: s.type,
        granularity: NedGranularity.PER_HOUR,
        classification: NedForecastClassification.CURRENT,
        activity: NedActivity.PRODUCTION,
        time_after: formatedOffsetDay(-1)!,
        time_before: formatedOffsetDay(1)!,
      },
    })),
  );
  gasConsumptionHandler.fetchMultipleSeries([
    {
      key: "gas",
      params: {
        type: NedDataType.CONSUMPTION_GAS_HOUSEHOLDS,
        granularity: NedGranularity.PER_DAY,
        classification: NedForecastClassification.CURRENT,
        activity: NedActivity.CONSUMPTION,
        time_after: formatedOffsetDay(-30)!,
        time_before: formatedOffsetDay(1)!,
      },
    },
  ]);
}

useAutoRefresh(fetchAll, 30 * 60); // refresh every 30 minutes

const chartOption = computed(() => ({
  legend: {
    orient: "vertical",
    right: 5,
    top: "center",
    data: SERIES.slice()
      .reverse()
      .map((s) => s.label),
    show: true,
  },
  grid: {
    left: 40,
    right: 130,
    top: 30,
    bottom: 30,
  },
  xAxis: {
    type: "time",
  },
  yAxis: {
    type: "value",
    name: "GWh",
  },
  series: SERIES.map((s) => {
    const isTotal = s.key === "total" || s.key === "demand";
    const data = (seriesData.value[s.key] ?? []).map((d) => [
      d.validfrom,
      d.volume / 1e6,
    ]) as [string | number, number | null][];
    if (s.key === "demand" && data.length > 0) {
      const lastDataPoint = data[data.length - 1];
      if (lastDataPoint) {
        lastDataPoint[1] = null;
      }
    }
    return {
      name: s.label,
      type: "line",
      smooth: true,
      showSymbol: false,
      data: data,
      stack: isTotal ? undefined : "production",
      areaStyle: isTotal ? undefined : {},
      lineStyle: isTotal ? { type: "dashed", width: 2 } : undefined,
    };
  }),
}));

const chartGasConsumptionOption = computed(() => ({
  xAxis: {
    type: "time",
  },
  yAxis: {
    type: "value",
    name: "GWh",
  },
  grid: {
    left: 40,
    // right: 130,
    top: 30,
    bottom: 30,
  },
  series: [
    {
      name: "Gasverbruik door huishoudens",
      type: "bar",
      data: gasConsumptionHandler.seriesData.value["gas"]?.map((d) => [
        d.validfrom,
        d.volume / 1e6,
      ]),
    },
  ],
}));
</script>
