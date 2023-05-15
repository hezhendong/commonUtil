import { Ref, ref } from 'vue';
type T = {
  value: string;
  label: string;
};

type TApiFun<T> = (...params) => Promise<T>;

export function useAutoRequest(options: Record<string, any>, fun: TApiFun<T>) {
  const { loading = false } = options || { loading: false };
  const requestLoading = ref(loading);
  const run = (...p) => {
    requestLoading.value = true;
    return fun(...p)
      .then(res => {
        return res;
      })
      .finally(() => {
        requestLoading.value = false;
      });
  };
  return [requestLoading, run];
}
