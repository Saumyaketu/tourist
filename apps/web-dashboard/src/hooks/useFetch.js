import { useEffect, useState } from "react";
import api from "../api/client";

/**
 * Simple fetch hook wrapper for GET endpoints
 * usage: const { data, loading, error } = useFetch('/v1/alerts')
 */
export default function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(path).then((r) => {
      if (!mounted) return;
      setData(r.data || r);
    }).catch((e) => {
      if (!mounted) return;
      setError(e);
    }).finally(() => mounted && setLoading(false));
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
