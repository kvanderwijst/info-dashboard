import { ref } from "vue";
import Papa from "papaparse";

export function useGriepData() {
  const weeks = ref<string[]>([]);
  const series = ref<{ name: string; type: string; data: number[] }[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchGriepData() {
    loading.value = true;
    error.value = null;

    try {
      const url = `/api/rivm/`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch RIVM data");

      const csvText = await response.text();

      // parse CSV
      const parsed = Papa.parse(csvText, {
        header: true,
        delimiter: ";",
        skipEmptyLines: true,
      });

      const rows = parsed.data;

      if (rows.length === 0) {
        throw new Error("CSV returned no data");
      }

      // headers = years
      const headers = Object.keys(rows[0]).filter((h) => h !== "");

      // x-axis
      weeks.value = rows.map((row: any) => row[""].replace(/"/g, ""));

      // series
      series.value = headers.map((year) => ({
        name: year,
        type: "line",
        data: rows.map((row: any) => {
          const value = row[year];
          return value === "" || value == null ? null : Number(value);
        }),
      }));
    } catch (err: any) {
      console.error(err);
      error.value = err.message || "Unknown error";
    } finally {
      loading.value = false;
    }
  }

  return {
    weeks,
    series,
    loading,
    error,
    fetchGriepData,
  };
}
