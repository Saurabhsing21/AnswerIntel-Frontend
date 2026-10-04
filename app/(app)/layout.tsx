import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { TOKEN_COOKIE } from "@/lib/api/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  if (!(await cookies()).get(TOKEN_COOKIE)) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
