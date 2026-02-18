<template>
  <v-chart
    v-bind="attrs"
    :key="chartKey"
    ref="chartRef"
    :option="mergedOption"
    :theme="isDark ? 'dark' : 'light'"
    class="chart"
  />
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  watch,
  useAttrs,
} from "vue";
import { useTheme } from "vuetify";
import merge from "lodash.merge";
import VChart from "vue-echarts";
import type { EChartsType } from "echarts";
import { use } from "echarts/core";
import { MarkLineComponent, MarkAreaComponent } from "echarts/components";
use([MarkLineComponent, MarkAreaComponent]);

import { useEChartsTheme } from "@/composables/useEChartsTheme";

const { colors, axisColor } = useEChartsTheme();
const attrs = useAttrs();

const baseOption = computed(() => ({
  color: colors.value,
  backgroundColor: "transparent",
  tooltip: { trigger: "axis" },
  grid: { left: 64, right: 32 },
}));
const mergedOption = computed(() => merge({}, baseOption.value, props.option));

const props = defineProps<{
  option: object;
  height?: number | string;
}>();

const chartRef = ref<InstanceType<typeof VChart>>();
defineExpose({
  getChart: () => chartRef.value,
});
const theme = useTheme();

const isDark = computed(() => theme.global.current.value.dark);
const chartKey = ref(0);

watch(isDark, () => {
  chartKey.value += 1;
});

let observer: ResizeObserver;

onMounted(() => {
  observer = new ResizeObserver(() => {
    chartRef.value?.resize();
  });

  observer.observe(chartRef.value!.$el);
});

onBeforeUnmount(() => {
  observer.disconnect();
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 350px;
}
</style>
