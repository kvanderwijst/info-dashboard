import { ref } from "vue";

export function useHomewizardGas() {
  const gasUsage = ref<number | null>(null);
  const loading = ref(false);
  const error = ref(false);

  async function fetchGas() {
    loading.value = true;
    error.value = false;

    try {
      const res = await fetch("/api/homewizard");

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();

      gasUsage.value = data.value;

      if (gasUsage.value === null) {
        error.value = true;
      }
    } catch {
      error.value = true;
    } finally {
      loading.value = false;
    }
  }

  return {
    gasUsage,
    loading,
    error,
    fetchGas,
  };
}
