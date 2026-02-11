import { onMounted, onUnmounted } from "vue";

export function useAutoRefresh(
  fn: () => void,
  interval_seconds: number,
  runImmediately = true,
) {
  let intervalId: number | undefined;

  onMounted(() => {
    if (runImmediately) fn();
    intervalId = window.setInterval(fn, interval_seconds * 1000);
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
}
