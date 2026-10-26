import type { Metadata } from "next";
import { CONTACT_EMAIL, LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms of Service - SeenLens" };

// A starting draft, not legal advice: have a lawyer review it before taking payments.
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms cover your use of SeenLens, a service that asks AI engines questions about your market and reports how they mention your brand and your competitors. By creating an account you agree to them."
      sections={[
        { title: "Your account", body: [
          "You need an account to use SeenLens. Give us accurate details, keep your password safe and tell us if you think someone else has used your account. You are responsible for what happens under your account.",
          "Accounts belong to people. Plans, projects and data belong to workspaces. The owners of a workspace decide who else can access it.",
        ] },
        { title: "Plans and payment", body: [
          "New accounts get a free trial of one scan for one brand, with no card needed. After that, SeenLens is a paid service with monthly and yearly plans. Prices are shown on our pricing page and charged in advance through Stripe. Plans renew automatically until you cancel.",
          "Each plan has limits, such as prompts, AI answers a month and projects. When you reach a limit, some actions wait until your allowance refills or until you move to a bigger plan.",
          "If a payment fails, you have 7 days to update your card. After that the workspace becomes read-only until you pay.",
        ] },
        { title: "Cancelling", body: [
          "You can cancel at any time from Manage billing. Your plan keeps working until the end of the period you paid for. After that the workspace is read-only: you can still view and export your data, but not run new scans. Refunds are covered in our Refund Policy.",
        ] },
        { title: "Acceptable use", body: [
          "Don't use SeenLens to:",
          [
            "break the law or anyone's rights,",
            "try to get around plan limits, security or rate limits,",
            "resell or share access outside your workspace without our agreement,",
            "send us content you have no right to use, or anything harmful.",
          ],
          "We may suspend accounts that do these things.",
        ] },
        { title: "AI answers and our analysis", body: [
          "SeenLens reports what AI engines answered when we asked them, and our analysis of those answers. AI answers change from run to run and over time, and our analysis can be wrong. Treat SeenLens as guidance, not a guarantee of how any AI engine will describe or rank you.",
        ] },
        { title: "Your data", body: [
          "You own the data you add, such as brands, competitors and prompts. You let us use it to run the service. The AI answers we collect for you are yours to use. How we handle personal data is in our Privacy Policy.",
        ] },
        { title: "Availability and changes", body: [
          "We work to keep SeenLens running but can't promise it will always be available or free of errors. We may change features. If we make a change that materially reduces what a paid plan includes, we will tell you in advance.",
        ] },
        { title: "Liability", body: [
          "SeenLens is provided as is. To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability is limited to what you paid us in the 12 months before the claim.",
        ] },
        { title: "Changes to these terms", body: [
          `We may update these terms. If a change matters, we will email the owners of each workspace before it takes effect. Questions go to ${CONTACT_EMAIL}.`,
        ] },
      ]}
    />
  );
}
