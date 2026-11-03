import { useCallback, useEffect, useState } from "react";
import {
  clearOrdoCache,
  getOrdoCompleteContent,
  getOrdoLiturgicalTimes,
  getOrdoPrincipalContent,
  getOrdoPrincipalFeasts,
  mergeOrdoCalendarContent,
} from "@/lib/ordo/client";
import type { OrdoCalendarData, OrdoCalendarErrors } from "@/lib/ordo/types";

const initialLoading = {
  principalFeasts: true,
  liturgicalTimes: true,
  principalContent: true,
  completeContent: true,
};

export function useOrdoCalendar() {
  const [retryKey, setRetryKey] = useState(0);
  const [data, setData] = useState<OrdoCalendarData>({
    principalFeasts: [],
    liturgicalTimes: [],
    principalContent: [],
    completeContent: [],
    entries: [],
    loadedAt: new Date(0),
  });
  const [loading, setLoading] = useState(initialLoading);
  const [errors, setErrors] = useState<OrdoCalendarErrors>({});

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const load = async <T,>(
      key: keyof typeof initialLoading,
      request: (signal: AbortSignal) => Promise<T>,
      update: (value: T) => void,
    ) => {
      try {
        const value = await request(controller.signal);
        if (!active) return;
        update(value);
        setErrors((current) => ({ ...current, [key]: undefined }));
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setErrors((current) => ({
          ...current,
          [key]: error instanceof Error ? error.message : "No fue posible consultar ORDO Colombia.",
        }));
      } finally {
        if (active) setLoading((current) => ({ ...current, [key]: false }));
      }
    };

    setLoading(initialLoading);
    setErrors({});
    setData({
      principalFeasts: [],
      liturgicalTimes: [],
      principalContent: [],
      completeContent: [],
      entries: [],
      loadedAt: new Date(0),
    });

    void Promise.all([
      load("principalFeasts", getOrdoPrincipalFeasts, (principalFeasts) =>
        setData((current) => ({ ...current, principalFeasts })),
      ),
      load("liturgicalTimes", getOrdoLiturgicalTimes, (liturgicalTimes) =>
        setData((current) => ({ ...current, liturgicalTimes })),
      ),
      load("principalContent", getOrdoPrincipalContent, (principalContent) =>
        setData((current) => ({
          ...current,
          principalContent,
          entries: mergeOrdoCalendarContent(current.completeContent, principalContent),
        })),
      ),
      load("completeContent", getOrdoCompleteContent, (completeContent) =>
        setData((current) => ({
          ...current,
          completeContent,
          entries: mergeOrdoCalendarContent(completeContent, current.principalContent),
        })),
      ),
    ]).then(() => {
      if (active) setData((current) => ({ ...current, loadedAt: new Date() }));
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryKey]);

  const retry = useCallback(() => {
    clearOrdoCache();
    setRetryKey((value) => value + 1);
  }, []);

  return { data, loading, errors, retry };
}
