import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// Next.js inlines its own bootstrap scripts, so scripts need 'unsafe-inline' without a nonce setup. The rest is
// strict: no framing, no plugins, no foreign forms, and only the third parties the site actually uses
// (Google sign-in, Sentry error reports, Paddle checkout).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client https://cdn.paddle.com${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style https://cdn.paddle.com",
  "img-src 'self' data: blob: https://*.paddle.com",
  "font-src 'self' data:",
  "connect-src 'self' https://accounts.google.com/gsi/ https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://*.paddle.com",
  "frame-src https://accounts.google.com/gsi/ https://*.paddle.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  // Local dev serves the dashboard from app.localhost (see lib/urls.ts).
  allowedDevOrigins: ["app.localhost"],
  // Pages only: API routes pass through the backend's own headers (report exports set their own stricter CSP).
  headers: async () => [{ source: "/((?!api/).*)", headers: securityHeaders }],
};

export default nextConfig;
