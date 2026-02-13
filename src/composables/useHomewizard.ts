import { ref } from "vue";

export function useHomewizardGas() {
  const currentGasUsage = ref<number | null>(null);
  const loading = ref(false);
  const error = ref(false);

  async function fetchCurrentGas() {
    loading.value = true;
    error.value = false;

    try {
      const res = await fetch("/api/homewizard");

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();

      currentGasUsage.value = data.value;

      if (currentGasUsage.value === null) {
        error.value = true;
      }
    } catch {
      error.value = true;
    } finally {
      loading.value = false;
    }
  }

  return {
    currentGasUsage,
    loading,
    error,
    fetchCurrentGas,
  };
}
