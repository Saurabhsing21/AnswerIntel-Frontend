import { Logo } from "@/components/ui/logo";

const links = [
  { label: "Engine sweep", href: "#top" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Signals", href: "#signals" },
  { label: "Competitors", href: "#competitors" },
  { label: "Experiments", href: "#experiments" },
  { label: "FAQ", href: "#faq" },
];

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 pt-14 md:flex-row md:items-start md:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-[280px] text-[14px] leading-relaxed text-muted">
            AI visibility intelligence for founders and small teams.
          </p>
        </div>
        <nav aria-label="Footer" className="md:ml-auto">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-[14px] text-ink-2 transition-colors hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-[1200px] px-5 pt-10 text-[13px] text-muted md:px-8">© 2026 AnswerIntel</div>
      <p
        aria-hidden
        className="mt-2 text-center font-display text-[19vw] leading-[0.8] font-semibold tracking-[-0.06em] text-ink/[0.05] select-none"
      >
        AnswerIntel
      </p>
    </footer>
  );
}
