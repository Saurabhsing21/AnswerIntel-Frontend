"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { buttonClass } from "@/components/ui/button";

/** A page crashed while rendering: say so plainly, report it, and offer a retry instead of a blank screen. */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-[22px] font-semibold text-ink">Something went wrong</h1>
      <p className="text-[14px] text-muted">
        This page hit an error. We have been notified. Try again, or come back in a minute.
        {error.digest && <span className="mt-2 block text-[12px] text-faint">Reference: {error.digest}</span>}
      </p>
      <button type="button" onClick={reset} className={buttonClass("primary")}>
        Try again
      </button>
    </main>
  );
}
