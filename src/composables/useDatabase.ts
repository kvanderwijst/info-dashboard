import { ref } from "vue";

export function useDatabase(type: string) {
  const data = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchData(start_date: string, end_date: string) {
    loading.value = true;
    error.value = null;

    try {
      const url = `/api/database/?type=${type}&start_date=${start_date}&end_date=${end_date}`;
      const response = await fetch(url);
      const dataRaw = await response.json();

      data.value = dataRaw.data;
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
