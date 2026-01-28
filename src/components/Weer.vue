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
            <img
              class="knmi-warning-map"
              src="https://cdn.knmi.nl/knmi/map/general/waarschuwing_land_48_new.gif?b918eee23974bdb7aef9f90f9864d54f"
            />
          </a>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";
const theme = useTheme();
import { onMounted } from "vue";

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
