import { useState, useEffect, useCallback } from 'react';

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useFetch<T>(fetchFn: (signal?: AbortSignal) => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchFn(controller.signal);
      setState({ data: result, isLoading: false, error: null });
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'CanceledError' && (err as Error)?.name !== 'AbortError') {
        const errorMsg = (err as Error)?.message || 'Error al obtener datos';
        setState({ data: null, isLoading: false, error: errorMsg });
      }
    }

    return () => {
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const cleanup = execute();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, [execute]);

  return {
    ...state,
    refetch: execute,
  };
}
