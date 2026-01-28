import { createApp } from "vue";
import App from "./App.vue";

import { use } from "echarts/core";
import { LineChart, BarChart, ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

import VueECharts from "vue-echarts";

use([
  LineChart,
  BarChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  SVGRenderer,
]);

import { vuetify } from "./plugins/vuetify";
import "@mdi/font/css/materialdesignicons.css";

import "leaflet";
import "leaflet/dist/leaflet.css";

const app = createApp(App).use(vuetify);
app.component("v-chart", VueECharts);
app.mount("#app");
