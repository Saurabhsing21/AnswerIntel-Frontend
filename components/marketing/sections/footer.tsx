import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Metrics", href: "#metrics" },
      { label: "Competitors", href: "#standing" },
      { label: "Experiments", href: "#experiments" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Join waitlist", href: "#waitlist" },
      { label: "FAQ", href: "#faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-night text-white">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div>
          <Logo inverse />
          <p className="mt-6 text-[22px] font-medium leading-tight tracking-[-0.03em]">
            AI visibility intelligence
            <span className="block text-white/45">for founders and small teams</span>
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-[14px] font-medium">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-[15px] text-white/55 transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[1200px] border-t border-white/10 px-5 py-6 text-[13px] text-white/45 md:px-10">
        © 2026 AnswerIntel. All rights reserved.
      </div>
    </footer>
  );
}
