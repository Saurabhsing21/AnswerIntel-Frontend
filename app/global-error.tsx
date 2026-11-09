"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/** The root layout itself failed, so none of the site's styles are available: keep this self-contained. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", background: "#fff", color: "#111" }}>
        <main style={{ maxWidth: 420, padding: 16, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#555" }}>SeenLense hit an error. We have been notified. Please try again.</p>
          <button type="button" onClick={reset} style={{ height: 44, padding: "0 20px", borderRadius: 999, border: 0, background: "#111", color: "#fff", fontSize: 15, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
