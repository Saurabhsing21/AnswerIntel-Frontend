import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local dev serves the dashboard from app.localhost (see lib/urls.ts).
  allowedDevOrigins: ["app.localhost"],
};

export default nextConfig;
