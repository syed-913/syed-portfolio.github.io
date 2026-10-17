import { useEffect, useState } from "react";

/** Keeps the existing public data loaders authoritative, with a recoverable UI state. */
export function usePublicData<T>(load: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (active) {
          setItems(data);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load, attempt]);
  const retry = () => {
    setLoading(true);
    setError(false);
    setAttempt((value) => value + 1);
  };
  return { items, loading, error, retry };
}
