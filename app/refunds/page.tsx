import type { Metadata } from "next";
import { CONTACT_EMAIL, LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Refund Policy - SeenLens" };

// A starting draft, not legal advice: have a lawyer review it before taking payments.
export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro="SeenLens is billed in advance. Here is what happens to your money when you cancel or change plans."
      sections={[
        { title: "Cancelling", body: [
          "You can cancel any time from Manage billing. You keep full access until the end of the period you already paid for, and you won't be charged again.",
        ] },
        { title: "Refunds", body: [
          "Monthly plans are not refunded for part of a month.",
          "Yearly plans: if you cancel within 14 days of your first yearly payment, we refund it in full. After that, yearly plans run to the end of the year you paid for.",
          `If something went wrong, such as a double charge or a long outage, email ${CONTACT_EMAIL} and we will put it right.`,
        ] },
        { title: "Changing plans", body: [
          "You can upgrade or downgrade from Manage billing. Stripe prorates the difference automatically, so you only pay for what you use of each plan.",
        ] },
        { title: "Failed payments", body: [
          "If a payment fails, you have 7 days to update your card before the workspace becomes read-only. Nothing is deleted.",
        ] },
      ]}
    />
  );
}
