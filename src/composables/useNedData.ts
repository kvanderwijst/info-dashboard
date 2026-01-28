import { ref } from "vue";

export interface NedDataRow {
  validfrom: string;
  validto: string;
  capacity: number;
  volume: number;
  percentage: number;
  lastupdate: string;
}

type SeriesKey = string;

function isValid(item: { lastupdate: string; validto: string }) {
  return new Date(item.lastupdate) >= new Date(item.validto);
}

export function useNedData() {
  const seriesData = ref<Record<SeriesKey, NedDataRow[]>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSeries(
    key: SeriesKey,
    params: Record<string, string | number>,
  ) {
    try {
      const query = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ).toString();

      const res = await fetch(`/api/ned_data?${query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const raw = json as NedDataRow[];
      seriesData.value[key] = raw.filter(isValid);
    } catch (e: any) {
      error.value = e.message;
    }
  }

  async function fetchMultipleSeries(
    series: Array<{ key: SeriesKey; params: Record<string, string | number> }>,
  ) {
    loading.value = true;
    error.value = null;

    await Promise.all(series.map((s) => fetchSeries(s.key, s.params)));

    loading.value = false;
  }

  return {
    seriesData,
    loading,
    error,
    fetchMultipleSeries,
  };
}
