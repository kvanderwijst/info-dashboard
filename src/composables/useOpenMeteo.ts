import { ref } from "vue";

export function useOpenMeteo() {
  const dataDaily = ref<any>([]);
  const dataHourly = ref<any>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchData(
    latitude: string,
    longitude: string,
    daily_vars: string,
    hourly_vars: string,
    past_days: string,
    forecast_days: string,
  ) {
    loading.value = true;
    error.value = null;

    try {
      const url = `/api/openmeteo/forecast?latitude=${latitude}&longitude=${longitude}&daily=${daily_vars}&hourly=${hourly_vars}&timezone=Europe%2FBerlin&past_days=${past_days}&forecast_days=${forecast_days}`;
      const response = await fetch(url);
      const dataRaw = await response.json();

      dataDaily.value = dataRaw["daily"];
      dataHourly.value = dataRaw["hourly"];
    } catch (e: any) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  return {
    dataDaily,
    dataHourly,
    loading,
    error,
    fetchData,
  };
}
