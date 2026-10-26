/** The free website check (/check) stays hidden until launch. Set NEXT_PUBLIC_FREE_CHECK=true to show it. */
export const FREE_CHECK = process.env.NEXT_PUBLIC_FREE_CHECK === "true";

/** Launch mode: only the marketing site and the waitlist are open (see proxy.ts). Set NEXT_PUBLIC_WAITLIST_ONLY=true. */
export const WAITLIST_ONLY = process.env.NEXT_PUBLIC_WAITLIST_ONLY === "true";
