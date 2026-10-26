import { redirect } from "next/navigation";

/** Sources now live on the Competitors page. */
export default async function SourcesPage({ params }: PageProps<"/projects/[id]/sources">) {
  const { id } = await params;
  redirect(`/projects/${id}/competitors#sources`);
}
