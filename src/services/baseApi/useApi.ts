import { useState, useEffect, useCallback, useRef } from "react";

type Options = {
  manual?: boolean; // default false → auto call
  deps?: any[];
};

export function useApiEffect<T>(
  apiFn: () => Promise<T>,
  options: Options = {}
) {
  const { manual = false, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const calledRef = useRef(false);

  const callApi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (!manual && !calledRef.current) {
      calledRef.current = true;
      callApi();
    }
  }, [manual, callApi]);

  return { data, error, loading, refetch: callApi };
}
