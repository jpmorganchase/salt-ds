import { redirect } from "next/navigation";

export default async function NamespaceIndex({
  params,
}: {
  params: Promise<{ namespace: string }>;
}) {
  const { namespace } = await params;
  redirect(`/${namespace}/index`);
}
