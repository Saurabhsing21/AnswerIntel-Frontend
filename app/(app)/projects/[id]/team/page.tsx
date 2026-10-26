import { redirect } from "next/navigation";

/** Team now lives on the Workspace page, next to plan and usage. */
export default async function TeamPage({ params }: PageProps<"/projects/[id]/team">) {
  const { id } = await params;
  redirect(`/projects/${id}/billing?tab=team`);
}
