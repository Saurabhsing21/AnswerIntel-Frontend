/**
 * The website and the dashboard live on separate hosts: seenlens.com and app.seenlens.com
 * (locally localhost:3100 and app.localhost:3100). With neither variable set, everything stays on one host.
 */
const trim = (url: string | undefined) => (url ?? "").replace(/\/$/, "");

export const SITE_URL = trim(process.env.NEXT_PUBLIC_SITE_URL);
export const APP_URL = trim(process.env.NEXT_PUBLIC_APP_URL);
export const SPLIT_HOSTS = Boolean(SITE_URL && APP_URL && SITE_URL !== APP_URL);

/** A dashboard path, absolute when the dashboard is on its own host. */
export const appHref = (path: string) => (SPLIT_HOSTS ? `${APP_URL}${path}` : path);
/** A website path, absolute when the website is on its own host. */
export const siteHref = (path: string) => (SPLIT_HOSTS ? `${SITE_URL}${path}` : path);

/** Paths served by the dashboard host; everything else belongs to the website. */
export const APP_PATHS = ["/projects", "/workspaces", "/account", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/invite", "/subscribe"];
export const isAppPath = (pathname: string) => APP_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
