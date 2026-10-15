"use client";
import { useEffect, useState, useCallback } from "react";
export function usePlatformData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => { setLoading(true); setError(""); setRevision(n => n + 1); }, []);
  useEffect(() => {
    let cancelled = false;
    loader().then(value => { if (!cancelled) { setData(value); setError(""); } }).catch(e => { if (!cancelled) setError(e?.message || "Unable to load server data"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loader, revision]);
  return { data, error, loading, reload };
}
