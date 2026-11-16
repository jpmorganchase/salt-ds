import {
  generateMosaicStaticParams,
  resolveMosaicMode,
  serializeMdxForClient,
} from "@jpmorganchase/mosaic-site-middleware";
import { CanonicalizeUrl } from "@jpmorganchase/mosaic-site-middleware/client";
import { buildMosaicMetadata } from "@jpmorganchase/mosaic-site-middleware/metadata";
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
  // The route inventory is independent of the SEO sitemap's exclusions.
  return generateMosaicStaticParams({
    pageExtensions: [".mdx"],
    // The inventory also lists folder and .mdx aliases; prerender each page
    // once at its extensionless canonical document URL.
    include: (route) =>
      route.pathname.startsWith("/salt/") &&
      route.pathname === route.sourcePathname.slice(0, -".mdx".length),
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const routeParams = await params;
  const result = await resolveContent(pathname(routeParams));
  if (result.kind !== "mdx") return {};

  const { title } = result.mdx.frontmatter;
  return {
    ...buildMosaicMetadata(result),
    title:
      typeof title === "string"
        ? `${routeParams.namespace} | ${title}`
        : undefined,
  };
}

export default async function DocumentationPage({ params }: PageProps) {
  const result = await resolveContent(pathname(await params));
  if (result.kind === "redirect") redirect(result.destination);
  if (result.kind === "not-found") notFound();

  const { mdx, pathname: route } = result;
  const { sharedConfig } = result;
  const source = await serializeMdxForClient(mdx.raw);
  if ("error" in source) throw source.error;

  return (
    <StoreShell
      key={route}
      storeProps={{ ...mdx.frontmatter, sharedConfig, route }}
    >
      <CanonicalizeUrl canonical={route} />
      <FrameSync sharedConfig={sharedConfig} route={route} />
      <Body source={source} />
    </StoreShell>
  );
}
