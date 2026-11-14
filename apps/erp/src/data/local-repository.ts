import { useEffect, useRef, useState } from "react";

export type DemoEntity = { id: string };

const COLLECTION_EVENT = "ao-erp:local-collection";

function notifyCollection(storageKey: string, records: DemoEntity[]) {
  try {
    window.dispatchEvent(new CustomEvent(COLLECTION_EVENT, { detail: { storageKey, records } }));
  } catch {
    // El entorno puede no disponer de eventos de navegador durante SSR/tests.
  }
}

export function readDemoCollection<T extends DemoEntity>(storageKey: string, initial: T[]): T[] {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as T[] | { records?: T[] };
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed.records)) return parsed.records;
    }
  } catch {
    // El navegador puede bloquear localStorage; en ese caso se usan fixtures.
  }
  return initial;
}

export function createDemoRepository<T extends DemoEntity>(storageKey: string, initial: T[]) {
  let current = initial;
  return {
    all: () => current,
    replace: (next: T[]) => {
      current = next;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* Estado de sesión */
      }
      return current;
    },
  };
}

export function appendDemoCollectionRecord<T extends DemoEntity>(
  storageKey: string,
  initial: T[],
  record: T,
): T[] {
  const current = readDemoCollection(storageKey, initial);
  const next = [...current, record];
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    /* Estado de sesión */
  }
  notifyCollection(storageKey, next);
  return next;
}

export function appendDemoCollectionRecords<T extends DemoEntity>(
  storageKey: string,
  initial: T[],
  recordsToAdd: T[],
): T[] {
  const current = readDemoCollection(storageKey, initial);
  const next = [...current, ...recordsToAdd];
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    /* Estado de sesión */
  }
  notifyCollection(storageKey, next);
  return next;
}

export function useLocalCollection<T extends DemoEntity>(storageKey: string, initial: T[]) {
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const activeKeyRef = useRef(storageKey);
  const [records, setRecords] = useState<T[]>(() => readDemoCollection(storageKey, initial));

  useEffect(() => {
    if (activeKeyRef.current !== storageKey) {
      activeKeyRef.current = storageKey;
      setRecords(readDemoCollection(storageKey, initialRef.current));
    }
  }, [storageKey]);

  useEffect(() => {
    const handleCollectionChange = (event: Event) => {
      const detail = (event as CustomEvent<{ storageKey?: string; records?: T[] }>).detail;
      if (detail?.storageKey === storageKey && detail.records) setRecords(detail.records);
    };
    window.addEventListener(COLLECTION_EVENT, handleCollectionChange);
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        setRecords(JSON.parse(event.newValue) as T[]);
      } catch {
        // Se conserva el estado actual cuando el valor almacenado no es válido.
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(COLLECTION_EVENT, handleCollectionChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [storageKey]);
  useEffect(() => {
    if (activeKeyRef.current !== storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(records));
    } catch {
      /* Estado de sesión */
    }
  }, [records, storageKey]);
  const replace = (next: T[]) => {
    setRecords(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      notifyCollection(storageKey, next);
    } catch {
      // El estado React sigue siendo utilizable sin persistencia del navegador.
    }
  };
  const create = (record: T) => {
    setRecords((current) => {
      const next = [...current, record];
      notifyCollection(storageKey, next);
      return next;
    });
  };
  const update = (id: string, changes: Partial<T>) =>
    setRecords((current) => {
      const next = current.map((record) => (record.id === id ? { ...record, ...changes } : record));
      notifyCollection(storageKey, next);
      return next;
    });
  const remove = (id: string) =>
    setRecords((current) => {
      const next = current.filter((record) => record.id !== id);
      notifyCollection(storageKey, next);
      return next;
    });
  return { records, replace, create, update, remove };
}
