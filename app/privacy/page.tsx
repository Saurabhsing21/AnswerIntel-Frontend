import type { Metadata } from "next";
import { CONTACT_EMAIL, LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy Policy - SeenLens" };

// A starting draft, not legal advice: have a lawyer review it before taking payments.
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what personal data SeenLens collects, why, who we share it with and the choices you have."
      sections={[
        { title: "What we collect", body: [
          [
            "Account details: your email address, name if you add one, and a hashed password. We never store your password itself.",
            "Workspace data: the brands, websites, competitors and prompts you add, and the AI answers and reports we produce for you.",
            "Billing details: handled by Stripe. We see your plan, payment status and invoices, but never your full card number.",
            "Waitlist: the email address you give us.",
            "Usage: privacy-friendly page analytics (Vercel Web Analytics, no cookies) and server logs used for security and debugging.",
          ],
        ] },
        { title: "Why we use it", body: [
          [
            "To run SeenLens: sign you in, run scans, show results and send the reports and alerts you ask for.",
            "To bill you and keep accounts secure.",
            "To send account emails, such as confirming your address, resetting a password, invitations and payment problems.",
            "To understand how the site is used, so we can improve it.",
          ],
          "We don't sell your personal data, and we don't use it for advertising.",
        ] },
        { title: "Who we share it with", body: [
          "We use these service providers, only for the purposes above:",
          [
            "Stripe: payments and invoices.",
            "Resend: sending email.",
            "Vercel: hosting the website and analytics.",
            "AI providers (through OpenRouter) and DataForSEO: we send them your prompts and brand details to get AI answers. We don't send them your account details.",
          ],
        ] },
        { title: "How long we keep it", body: [
          "We keep account and workspace data while your account is open. AI answers are kept for the history period of your plan. When you ask us to delete your account, we delete your data within 30 days, except what we must keep for tax and accounting.",
        ] },
        { title: "Your choices and rights", body: [
          `You can see and change your account details in the app, export your answers as CSV, and ask us to delete your account. Depending on where you live, you may have more rights, such as access, correction, portability or objection. To use them, email ${CONTACT_EMAIL}.`,
        ] },
        { title: "Security", body: [
          "We use encrypted connections, hashed passwords, short-lived sessions, and access controls so people only see their own workspaces. No system is perfectly secure. If a breach affects your data, we will tell you.",
        ] },
        { title: "Changes", body: [
          "If we change this policy in a way that matters, we will email account holders before the change takes effect.",
        ] },
      ]}
    />
  );
}
