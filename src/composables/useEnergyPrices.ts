import { ref } from "vue";

export function useEnergyPrices() {
  const data = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchPrices(
    priceType: string,
    interval: string,
    startDate: string,
    endDate: string,
  ) {
    loading.value = true;
    error.value = null;

    try {
      const url = `/api/anwb/${priceType}?startDate=${startDate}&endDate=${endDate}&interval=${interval}`;
      const response = await fetch(url);
      const dataRaw = await response.json();

      data.value = dataRaw.data.map((entry: any) => ({
        date: entry.date,
        marktprijs: entry.values.marktprijs / 100,
        allInPrijs: entry.values.allInPrijs / 100,
      }));
    } catch (e: any) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  return {
    data,
    loading,
    error,
    fetchPrices,
  };
}
