import { ref, computed } from "vue";

export function useLuchtmeetnet() {
  const stations = ref<any[]>([]);
  const measurements = ref<any[]>([]);
  const measurementsForStation = ref<any[]>([]);
  const componentLimits = ref<any>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const stationsById = computed(() => {
    const map: Record<string, any> = {};
    stations.value.forEach((station) => {
      map[station.id] = station;
    });
    return map;
  });

  async function fetchStations() {
    const res = await fetch(
      "https://api2020.luchtmeetnet.nl/stations?show_website=true&limit=999&measurement_method=active",
    );
    const data = await res.json();
    stations.value = data.result;
  }

  async function fetchMeasurements(
    start: string,
    end: string,
    formula: string,
  ) {
    const url = `https://api2020.luchtmeetnet.nl/measurements?formula=${formula}&start=${start}&end=${end}&limit=1000`;
    const res = await fetch(url);
    console.log(url);
    const data = await res.json();
    measurements.value = data.result;
  }

  async function fetchComponentLimits(formula: string) {
    const url = `https://api2020.luchtmeetnet.nl/open_api/components/${formula}`;
    const res = await fetch(url);
    const data = await res.json();
    componentLimits.value = data.data;
  }

  async function fetchMeasurementsForStation(
    stationId: string,
    start: string,
    end: string,
    formula: string,
  ) {
    const res = await fetch(
      `https://api2020.luchtmeetnet.nl/measurements?station_id=${stationId}&formula=${formula}&start=${start}&end=${end}&limit=999&zero_fill=1&order_direction=asc&status=validated,unvalidated`,
    );
    const data = await res.json();
    measurementsForStation.value = data.result;
  }

  // Combine stations and latest measurement
  function getStationsWithLatestValue() {
    return stations.value.map((station) => {
      const stationMeasurements = measurements.value
        .filter((m) => m.station_id === station.id)
        .sort(
          (a, b) =>
            new Date(b.timestamp_measured).getTime() -
            new Date(a.timestamp_measured).getTime(),
        );
      let latest_value: number | null;
      let latest_rating: number | null;
      if (stationMeasurements.length > 0) {
        latest_value = stationMeasurements[0].value;
        latest_rating = stationMeasurements[0].rating;
      } else {
        latest_value = null;
        latest_rating = null;
      }
      return {
        ...station,
        latest_value: latest_value,
        latest_rating: latest_rating,
      };
    });
  }

  return {
    stations,
    stationsById,
    measurements,
    measurementsForStation,
    componentLimits,
    loading,
    error,
    fetchStations,
    fetchMeasurements,
    fetchMeasurementsForStation,
    fetchComponentLimits,
    getStationsWithLatestValue,
  };
}
