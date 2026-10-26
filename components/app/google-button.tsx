"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleId = {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

/** Google's own sign-in button (Google Identity Services). Hidden until a client ID is configured. */
export function GoogleButton({ text, onCredential }: { text: "signin_with" | "signup_with" | "continue_with"; onCredential: (credential: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const callback = useRef(onCredential);
  useEffect(() => {
    callback.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const id = window.google?.accounts.id;
    if (!ready || !id || !box.current) return;
    id.initialize({ client_id: CLIENT_ID, callback: (r) => callback.current(r.credential) });
    id.renderButton(box.current, { theme: "outline", size: "large", shape: "pill", text, width: box.current.offsetWidth || 336, logo_alignment: "center" });
  }, [ready, text]);

  if (!CLIENT_ID) return null;
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} />
      <div ref={box} className="flex h-10 w-full justify-center [&_iframe]:!mx-auto" />
    </>
  );
}
