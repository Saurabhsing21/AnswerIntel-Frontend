import Link from "next/link";
import { Logo } from "@/components/ui/logo";

/** The single-card layout of the account pages: reset password, verify email, invitations. */
export function AuthCard({ title, body, children, footer }: { title: string; body?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-page px-4 py-10">
      <div className="w-full max-w-[400px]">
        <Link href="/login" className="mb-8 flex justify-center">
          <Logo size="lg" />
        </Link>
        <div className="rounded-[20px] border border-line-strong bg-surface p-6 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.2)] md:p-8">
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em]">{title}</h1>
          {body && <p className="mt-1 text-[14px] text-muted">{body}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
        {footer && <p className="mt-5 text-center text-[13px] text-muted">{footer}</p>}
      </div>
    </div>
  );
}
