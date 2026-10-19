"use client";

import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  /** `limit` names the plan limit that was hit (projects, seats, subscription...), so the UI can offer an upgrade. */
  constructor(public status: number, public code: string, message: string, public limit?: string) {
    super(message);
  }
}

export const UNAUTHORIZED_EVENT = "answerintel:unauthorized";
/** Fired with the ApiError as `detail` whenever a request is refused by the workspace's plan. */
export const PLAN_LIMIT_EVENT = "seenlens:plan-limit";

export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(path.startsWith("/api/") ? path : `/api/backend${path}`, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/api/auth")) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT)); // AppShell sends the user to /login
    }
    const error = new ApiError(res.status, data?.error?.code ?? "ERROR", data?.error?.message ?? "Something went wrong.", data?.error?.limit);
    if (error.limit) window.dispatchEvent(new CustomEvent(PLAN_LIMIT_EVENT, { detail: error })); // AppShell offers an upgrade
    throw error;
  }
  return data as T;
}

/**
 * GET a resource. `refreshMs` may depend on the latest data, so a page can poll
 * only while, say, a scan is running.
 */
export function useApi<T>(path: string | null, refreshMs?: number | ((data: T | null) => number | undefined)) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    api<T>(path)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((e: ApiError) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const interval = typeof refreshMs === "function" ? refreshMs(data) : refreshMs;
  useEffect(() => {
    if (!interval || !path) return;
    const t = setInterval(() => setTick((n) => n + 1), interval);
    return () => clearInterval(t);
  }, [interval, path]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { data, error, loading, reload, setData };
}
