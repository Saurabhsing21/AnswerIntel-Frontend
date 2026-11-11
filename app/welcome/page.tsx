import type { Metadata } from "next";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/marketing/section";
import { Footer } from "@/components/marketing/sections/footer";
import { Nav } from "@/components/marketing/sections/nav";
import { ButtonArrow, buttonClass } from "@/components/ui/button";
import { appHref } from "@/lib/urls";

export const metadata: Metadata = { title: "Welcome - SeenLense", robots: { index: false } };

/** Where Paddle's checkout lands after a successful payment. The plan itself is switched on by the webhook. */
export default function WelcomePage() {
  return (
    <>
      <Nav />
      <main>
        <Section innerClassName="md:pt-16">
          <div className="mx-auto flex max-w-[520px] flex-col items-center text-center">
            <CheckCircle size={44} weight="fill" className="text-up" />
            <h1 className="mt-5 font-display text-[36px] leading-tight font-semibold tracking-[-0.03em]">Welcome to SeenLense</h1>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              Your payment went through and your receipt is on its way by email. Your plan is ready in your dashboard within a few seconds.
            </p>
            <a href={appHref("/projects?checkout=success")} className={`${buttonClass("primary")} mt-7`}>
              Open your dashboard
              <ButtonArrow />
            </a>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
