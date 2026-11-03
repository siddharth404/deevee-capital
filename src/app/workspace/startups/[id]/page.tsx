import { redirect } from "next/navigation";

export default async function WorkspaceStartupDeepLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const query = new URLSearchParams({ startupId: id });
  if (tab) query.set("tab", tab);
  redirect(`/workspace?${query.toString()}`);
}
