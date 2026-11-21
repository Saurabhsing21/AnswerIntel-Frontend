"use client";

import { useCallback, useEffect, useState } from "react";

/** Who holds the plan's shared question pool: sent with a question-limit error and when new questions land switched off. */
export type PoolDetails = { holders: { project_id: string; brand: string; active: number }[]; limit: number };

export class ApiError extends Error {
  /** `limit` names the plan limit that was hit (projects, seats, subscription...), so the UI can offer an upgrade. */
  constructor(public status: number, public code: string, message: string, public limit?: string, public details?: PoolDetails) {
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
  if (path.startsWith("/api/auth/") || res.status === 401) cache.clear(); // signing in or out: never show one person's data to the next
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/api/auth")) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT)); // AppShell sends the user to /login
    }
    const error = new ApiError(res.status, data?.error?.code ?? "ERROR", data?.error?.message ?? "Something went wrong.", data?.error?.limit, data?.error?.details);
    if (error.limit && !error.details) window.dispatchEvent(new CustomEvent(PLAN_LIMIT_EVENT, { detail: error })); // AppShell offers an upgrade (a full question pool is explained in place instead)
    throw error;
  }
  return data as T;
}

// The last answer for each GET path, so a page you come back to shows at once while a fresh copy loads.
const cache = new Map<string, unknown>();
// Requests under way, so components asking for the same path together (the sidebar and the banner both want
// /auth/me) share one call: the API runs on a small server where every extra request makes the others wait.
const inflight = new Map<string, Promise<unknown>>();

/** A reload or a poll always asks the API again; a first load joins a request for the same path already under way. */
function load<T>(path: string, fresh: boolean): Promise<T> {
  let pending = fresh ? undefined : inflight.get(path);
  if (!pending) {
    const request: Promise<unknown> = api<T>(path)
      .then((result) => {
        cache.set(path, result);
        return result;
      })
      .finally(() => inflight.get(path) === request && inflight.delete(path));
    inflight.set(path, request);
    pending = request;
  }
  return pending as Promise<T>;
}

/**
 * GET a resource. `refreshMs` may depend on the latest data, so a page can poll
 * only while, say, a scan is running.
 */
export function useApi<T>(path: string | null, refreshMs?: number | ((data: T | null) => number | undefined)) {
  const [data, setData] = useState<T | null>(() => (path && cache.has(path) ? (cache.get(path) as T) : null));
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(Boolean(path) && !(path && cache.has(path)));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    load<T>(path, tick > 0)
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
