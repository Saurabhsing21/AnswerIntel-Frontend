import { redirect } from "next/navigation";

/** Experiments now live on the To-do page, as tracked fixes. */
export default async function ExperimentsPage({ params }: PageProps<"/projects/[id]/experiments">) {
  const { id } = await params;
  redirect(`/projects/${id}/opportunities?tab=tracked`);
}
