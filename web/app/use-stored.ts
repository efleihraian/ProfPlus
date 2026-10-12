import {useCallback, useEffect, useRef, useState} from "react";
// UI-only persistence in the browser; cleared on logout (profplus- prefix).
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    void Promise.resolve().then(() => {
      try { const raw = localStorage.getItem("profplus-" + key); if (raw) setValue(JSON.parse(raw) as T); } catch {}
      loaded.current = true;
    });
  }, [key]);
  const update = useCallback((next: T | ((previous: T) => T)) => {
    setValue(previous => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(previous) : next;
      if (loaded.current) try { localStorage.setItem("profplus-" + key, JSON.stringify(resolved)); } catch {}
      return resolved;
    });
  }, [key]);
  return [value, update] as const;
}
