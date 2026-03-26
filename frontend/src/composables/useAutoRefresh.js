import { ref, watch } from 'vue';

const refreshSignal = ref(0);

export function useAutoRefresh() {
  const triggerRefresh = () => {
    refreshSignal.value = Date.now();
  };

  const onRefresh = (callback) => {
    watch(refreshSignal, () => {
      callback();
    });
  };

  return {
    triggerRefresh,
    onRefresh,
    refreshSignal,
  };
}
