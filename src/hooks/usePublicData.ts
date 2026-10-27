import { useEffect, useState } from "react";
import { usePublicSnapshot } from "../context/PublicSnapshotContext";
import type { PublicSnapshot } from "../lib/publicSnapshot";

/** Keeps the existing public data loaders authoritative, with a recoverable UI state. */
export function usePublicData<T>(load: () => Promise<T[]>, key?: Exclude<keyof PublicSnapshot, 'settings'>) {
  const snapshot = usePublicSnapshot();
  const initial = key && snapshot ? snapshot[key] as T[] : undefined;
  const [items, setItems] = useState<T[]>(initial ?? []);
  const [loading, setLoading] = useState(!initial);
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
