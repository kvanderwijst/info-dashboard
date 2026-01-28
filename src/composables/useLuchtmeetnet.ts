import { ref } from "vue";

export function useLuchtmeetnet() {
  const stations = ref<any[]>([]);
  const measurements = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchStations() {
    const res = await fetch(
      "https://api2020.luchtmeetnet.nl/stations?show_website=true&limit=999&measurement_method=active",
    );
    const data = await res.json();
    stations.value = data.result;
  }

  async function fetchMeasurements(start: string, end: string) {
    const res = await fetch(
      `https://api2020.luchtmeetnet.nl/lki?start=${start}&end=${end}&limit=1000`,
    );
    const data = await res.json();
    measurements.value = data.result;
  }

  // Combine stations and latest measurement
  function getStationsWithLatestValue() {
    return stations.value.map((station) => {
      const stationMeasurements = measurements.value
        .filter((m) => m.station_number === station.number)
        .sort(
          (a, b) =>
            new Date(b.timestamp_measured).getTime() -
            new Date(a.timestamp_measured).getTime(),
        );
      const latestValue = stationMeasurements.length
        ? stationMeasurements[0].value
        : null;
      return { ...station, latest_value: latestValue };
    });
  }

  return {
    stations,
    measurements,
    loading,
    error,
    fetchStations,
    fetchMeasurements,
    getStationsWithLatestValue,
  };
}
