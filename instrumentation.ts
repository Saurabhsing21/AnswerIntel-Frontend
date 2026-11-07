import * as Sentry from "@sentry/nextjs";

// Server and edge errors go to Sentry. Empty DSN = monitoring off (local development).
export function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) Sentry.init({ dsn, environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV, tracesSampleRate: 0 });
}

export const onRequestError = Sentry.captureRequestError;
