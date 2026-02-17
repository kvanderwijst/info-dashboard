import { ref } from "vue";

export function useOpenMeteo() {
  const data = ref<any>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchData(past_days: number, forecast_days: number) {
    loading.value = true;
    error.value = null;

    try {
      const url = `/api/openmeteo/?past_days=${past_days}&forecast_days=${forecast_days}`;
      const response = await fetch(url);
      const dataRaw = await response.json();

      data.value = dataRaw["daily"];
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
    fetchData,
  };
}
