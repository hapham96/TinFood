import { useState, useCallback, useEffect } from "react";

type Options = {
  auto?: boolean; // default true
};

export function useApi<T>(
  fn: () => Promise<T>,
  options: Options = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const auto = options.auto ?? true;

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      setData(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fn]);

  useEffect(() => {
    if (auto) {
      refetch();
    }
  }, [auto, refetch]);

  return { data, error, loading, refetch };
}
