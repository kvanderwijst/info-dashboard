<template>
  <v-row>
    <v-col cols="12">
      <h3>Weer</h3>
    </v-col>
    <v-col cols="12" md="12" lg="4">
      <v-card>
        <v-card-text>
          <div :class="['weather-wrapper', theme.global.name.value]">
            <div
              id="ww_57eaf68f77cb5"
              v="1.3"
              loc="id"
              a='{"t":"horizontal","lang":"en","sl_lpl":1,"ids":["wl7885"],"font":"Arial","sl_ics":"one","sl_sot":"celsius","cl_bkg":"#FFFFFF00","cl_font":"#000000","cl_cloud":"#d4d4d4","cl_persp":"#2196F3","cl_sun":"#FFC107","cl_moon":"#FFC107","cl_thund":"#FF5722"}'
            >
              More forecasts:
              <a
                href="https://oneweather.org/amsterdam/30_days/"
                id="ww_57eaf68f77cb5_u"
                target="_blank"
                >30 day weather forecast Amsterdam</a
              >
            </div>
            <div class="delimiter"></div>
            <h3>Komende 7 dagen</h3>
            <div
              id="ww_8e93779fb7e6b"
              v="1.3"
              loc="id"
              a='{"t":"responsive","lang":"en","sl_lpl":1,"ids":["wl7885"],"font":"Arial","sl_ics":"one","sl_sot":"celsius","cl_bkg":"#FFFFFF00","cl_font":"#000000","cl_cloud":"#d4d4d4","cl_persp":"#2196F3","cl_sun":"#FFC107","cl_moon":"#FFC107","cl_thund":"#FF5722","cl_odd":"#0000000a","el_cwi":3,"el_ctm":3}'
            >
              More forecasts:
              <a
                href="https://oneweather.org/amsterdam/30_days/"
                id="ww_8e93779fb7e6b_u"
                target="_blank"
                >30 day weather forecast Amsterdam</a
              >
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" lg="4">
      <v-card>
        <v-card-text>
          <iframe
            src="https://gadgets.buienradar.nl/gadget/zoommap/?lat=51.98&lng=5.91111&overname=2&zoom=6&naam=Arnhem&size=3&voor=0"
            width="550"
            height="512"
            frameborder="no"
            style="margin: 0 auto; display: block"
          ></iframe>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" lg="4">
      <v-card>
        <v-card-title>KNMI Waarschuwingen</v-card-title>
        <v-card-text>
          <a
            href="https://www.knmi.nl/nederland-nu/weer/waarschuwingen/gelderland"
            target="_blank"
          >
            <img class="knmi-warning-map" :src="mapUrl" />
          </a>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-text>
          <highcharts :options="options_temperatuur" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-text>
          <highcharts :options="options_bewolking" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-text>
          <highcharts :options="options_neerslag" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-text>
          <highcharts :options="options_neerslagsom" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";
const theme = useTheme();
import { onMounted, ref } from "vue";
import { useAutoRefresh } from "@/composables/useAutoRefresh";
import type { Options, YAxisOptions } from "highcharts";

onMounted(() => {
  // Prevent loading the script multiple times
  if (document.getElementById("weatherwidget-script")) return;

  const script = document.createElement("script");
  script.id = "weatherwidget-script";
  script.src = "https://app3.weatherwidget.org/js/?id=ww_57eaf68f77cb5";
  script.async = true;

  const script2 = document.createElement("script");
  script2.id = "weatherwidget-script-2";
  script2.src = "https://app3.weatherwidget.org/js/?id=ww_8e93779fb7e6b";
  script2.async = true;

  document.body.appendChild(script);
  document.body.appendChild(script2);
});

const baseUrl =
  "https://cdn.knmi.nl/knmi/map/general/waarschuwing_land_48_new.gif";

const mapUrl = ref("");

function updateMap() {
  mapUrl.value = `${baseUrl}?t=${Date.now()}`;
}

// refresh every 30 minutes
useAutoRefresh(updateMap, 30 * 60);

// Get KNMI expert ensemble values
const url_temperatuur =
  "https://cdn.knmi.nl/knmi/json/page/weer/waarschuwingen_verwachtingen/ensemble/iPluim/260_Expert_99999.json";
const url_bewolking =
  "https://cdn.knmi.nl/knmi/json/page/weer/waarschuwingen_verwachtingen/ensemble/iPluim/260_Expert_20010.json";
const url_neerslag =
  "https://cdn.knmi.nl/knmi/json/page/weer/waarschuwingen_verwachtingen/ensemble/iPluim/260_Expert_13021.json";
const url_neerslagsom =
  "https://cdn.knmi.nl/knmi/json/page/weer/waarschuwingen_verwachtingen/ensemble/iPluim/260_Expert_13011.json";

const options_temperatuur = ref({});
const options_bewolking = ref({});
const options_neerslag = ref({});
const options_neerslagsom = ref({});

function adjustOptions(options: Options): Options {
  const yAxes: YAxisOptions[] = Array.isArray(options.yAxis)
    ? options.yAxis
    : options.yAxis
      ? [options.yAxis]
      : [{} as YAxisOptions]; // fallback empty axis if undefined
  return {
    ...options,
    chart: {
      ...options.chart,
      borderColor: "transparent",
    },
    yAxis: [yAxes[0] || ({} as YAxisOptions)], // only show the first y-axis
  };
}

onMounted(async () => {
  try {
    const responses = await Promise.all([
      fetch(url_temperatuur),
      fetch(url_bewolking),
      fetch(url_neerslag),
      fetch(url_neerslagsom),
    ]);

    const [temperatuur, bewolking, neerslag, neerslagsom] = await Promise.all(
      responses.map((r) => r.json()),
    );

    options_temperatuur.value = adjustOptions(temperatuur);
    options_bewolking.value = adjustOptions(bewolking);
    options_neerslag.value = adjustOptions(neerslag);
    options_neerslagsom.value = adjustOptions(neerslagsom);
  } catch (error) {
    console.error("KNMI fetch failed:", error);
  }
});
</script>

<style scoped>
/* light theme */
.weather-wrapper.light {
  #ww_57eaf68f77cb5,
  #ww_8e93779fb7e6b {
    color: #000 !important;
  }
}

/* dark theme */
.weather-wrapper.dark {
  #ww_57eaf68f77cb5,
  #ww_8e93779fb7e6b {
    color: #fff !important;
  }
}

.weather-wrapper #ww_57eaf68f77cb5 {
  max-width: unset;
}

.weather-wrapper #ww_8e93779fb7e6b .ww_col1 {
  display: none !important;
}

.delimiter {
  vertical-align: baseline;
  padding: 0;
  margin: 0;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
  height: 1px;
  background-color: #ffffff3d;
}

.knmi-warning-map {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: block;
  height: auto;
}
</style>
