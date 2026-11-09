import {
  loadSitemap,
  resolveMosaicMode,
  serializeMdxForClient,
} from "@jpmorganchase/mosaic-site-middleware";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Body } from "../../../Body/Body";
import { resolveContent } from "../../../lib/content";
import { StoreShell } from "../../providers";
import { FrameSync } from "../NamespaceFrame";

type PageProps = {
  params: Promise<{ namespace: string; route: string[] }>;
};

function pathname({ namespace, route }: Awaited<PageProps["params"]>) {
  return `/${[namespace, ...route].join("/")}`;
}

export async function generateStaticParams() {
  // Development renders requested pages on demand, including in snapshot mode.
  if (
    process.env.NODE_ENV !== "production" ||
    resolveMosaicMode().mode !== "snapshot-file"
  )
    return [];
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
  const result = await resolveContent(pathname(routeParams));
  if (result.kind !== "mdx") return {};

  const { title, description, breadcrumbs } = result.mdx.frontmatter;
  return {
    title:
      typeof title === "string"
        ? `${routeParams.namespace} | ${title}`
        : undefined,
    description: typeof description === "string" ? description : undefined,
    alternates: {
      canonical: result.pathname,
    },
    other:
      Array.isArray(breadcrumbs) && breadcrumbs.length > 0
        ? { breadcrumbs: JSON.stringify(breadcrumbs) }
        : undefined,
  };
}

export default async function DocumentationPage({ params }: PageProps) {
  const result = await resolveContent(pathname(await params));
  if (result.kind === "redirect") redirect(result.destination);
  if (result.kind === "not-found") notFound();

  const { mdx, pathname: route } = result;
  let { sharedConfig } = result;
  const authored = mdx.frontmatter.sharedConfig;
  if (authored && typeof authored === "object" && !Array.isArray(authored)) {
    // Page-specific header/footer settings override the folder defaults.
    // Capabilities still describe the source, so only Mosaic supplies them.
    const { sourceCapabilities: _authoredCapabilities, ...overrides } =
      authored as Record<string, unknown>;
    sharedConfig = { ...sharedConfig, ...overrides };
  }
  const source = await serializeMdxForClient(mdx.raw);
  if ("error" in source) throw source.error;

  return (
    <StoreShell
      key={route}
      storeProps={{ ...mdx.frontmatter, sharedConfig, route }}
    >
      <FrameSync sharedConfig={sharedConfig} route={route} />
      <Body source={source} />
    </StoreShell>
  );
}
