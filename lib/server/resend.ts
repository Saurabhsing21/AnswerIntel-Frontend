/**
 * Waitlist through Resend: the list lives in a Resend Audience, so launch needs no backend or database.
 * Resend allows about 2 requests a second per team, so calls retry briefly when rate-limited.
 */
const API = "https://api.resend.com";

async function call(path: string, init?: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.status !== 429 || attempt === 3) return res;
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
  }
}

export const resendWaitlistEnabled = () => Boolean(process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID);

/** Adds the address to the waitlist Audience. Returns false when it was already there. Throws when Resend fails. */
export async function addToWaitlist(email: string): Promise<boolean> {
  const audience = process.env.RESEND_AUDIENCE_ID!;
  const existing = await call(`/audiences/${audience}/contacts/${encodeURIComponent(email)}`);
  if (existing.ok) return false;
  if (existing.status !== 404) throw new Error(`lookup ${existing.status}`);
  const created = await call(`/audiences/${audience}/contacts`, { method: "POST", body: JSON.stringify({ email, unsubscribed: false }) });
  if (!created.ok) throw new Error(`create ${created.status}`);
  return true;
}

/** Best effort: a failed confirmation never undoes the signup. */
export async function sendWaitlistConfirmation(email: string): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) return;
  const site = process.env.SITE_URL ?? "https://seenlens.vercel.app";
  await call("/emails", {
    method: "POST",
    body: JSON.stringify({ from, to: [email], subject: "You're on the SeenLens waitlist", html: confirmationHtml(site) }),
  }).catch(() => undefined);
}

function confirmationHtml(site: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#171717">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e5e5e5;border-radius:20px">
<tr><td style="padding:36px 36px 8px">
<p style="margin:0 0 24px;font-size:18px;font-weight:600">SeenLens</p>
<h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;letter-spacing:-0.02em">You're on the list.</h1>
<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#404040">Thanks for joining. SeenLens shows you when ChatGPT, Perplexity, Gemini and Google AI recommend your brand, when they pick a competitor instead, and what to fix.</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#404040">We're opening access in small groups. We'll email you as soon as your spot is ready, and your first scan is on us.</p>
</td></tr>
<tr><td style="padding:8px 36px 36px">
<a href="${site}" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;padding:12px 20px;border-radius:999px">Visit SeenLens</a>
</td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;color:#a3a3a3">You got this because this address joined the SeenLens waitlist.</p>
</td></tr></table>
</body></html>`;
}
