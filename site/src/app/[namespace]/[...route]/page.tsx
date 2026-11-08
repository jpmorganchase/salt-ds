import {
  loadSitemap,
  resolveMosaicMode,
  serializeMdxForClient,
} from "@jpmorganchase/mosaic-site-middleware";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Body } from "../../../Body/Body";
import { canonicalRoute, resolveContent } from "../../../lib/content";
import { StoreShell } from "../../providers";
import { FrameSync } from "../NamespaceFrame";

type PageProps = {
  params: Promise<{ namespace: string; route: string[] }>;
};

function pathname({ namespace, route }: Awaited<PageProps["params"]>) {
  return `/${[namespace, ...route].join("/")}`;
}

export async function generateStaticParams() {
  if (resolveMosaicMode().mode !== "snapshot-file") return [];
  const routes = await loadSitemap();
  return routes.flatMap((path) => {
    const [namespace, ...route] = path.split("/").filter(Boolean);
    // The release-note feed supplies landing cards, not document pages.
    return namespace === "salt" && route.length > 0
      ? [{ namespace, route }]
      : [];
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const routeParams = await params;
  const { content, pathname: resolvedPath } = await resolveContent(
    pathname(routeParams),
  );
  if (content.kind !== "mdx") return {};

  const { title, description, breadcrumbs } = content.frontmatter;
  return {
    title:
      typeof title === "string"
        ? `${routeParams.namespace} | ${title}`
        : undefined,
    description: typeof description === "string" ? description : undefined,
    alternates: {
      canonical: canonicalRoute(content.frontmatter, resolvedPath),
    },
    other:
      Array.isArray(breadcrumbs) && breadcrumbs.length > 0
        ? { breadcrumbs: JSON.stringify(breadcrumbs) }
        : undefined,
  };
}

export default async function DocumentationPage({ params }: PageProps) {
  const result = await resolveContent(pathname(await params));
  const { content, sharedConfig } = result;
  if (content.kind === "redirect") redirect(content.destination);
  if (content.kind === "not-found") notFound();

  const route = canonicalRoute(content.frontmatter, result.pathname);
  const source = await serializeMdxForClient(content.raw);
  if ("error" in source) throw source.error;

  return (
    <StoreShell
      key={route}
      storeProps={{ ...content.frontmatter, sharedConfig, route }}
    >
      <FrameSync sharedConfig={sharedConfig} route={route} />
      <Body source={source} />
    </StoreShell>
  );
}
