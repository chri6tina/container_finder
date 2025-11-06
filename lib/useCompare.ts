import { useEffect, useState } from 'react';

const STORAGE_KEY = 'compareIds';

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setIds(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  function add(id: string) {
    setIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id].slice(0, 4);
      return next;
    });
  }

  function remove(id: string) {
    setIds((prev) => prev.filter((x) => x !== id));
  }

  function clear() {
    setIds([]);
  }

  return { ids, add, remove, clear };
}


