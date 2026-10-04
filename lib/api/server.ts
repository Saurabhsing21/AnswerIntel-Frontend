
export const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");
export const TOKEN_COOKIE = "ai_session";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60, // matches the API's JWT lifetime
};

export function errorBody(code: string, message: string) {
  return { error: { code, message } };
}
