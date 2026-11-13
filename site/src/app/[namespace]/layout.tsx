import {
  getSearchData,
  getSharedConfig,
  resolveMosaicMode,
} from "@jpmorganchase/mosaic-site-middleware";
import type { ReactNode } from "react";
import type { NamespaceData } from "../providers";
import { NamespaceFrame } from "./NamespaceFrame";

export default async function NamespaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ namespace: string }>;
}) {
  const { namespace } = await params;
  const { mode, contentUrl } = resolveMosaicMode();
  const [sharedConfig, search] = await Promise.all([
    getSharedConfig(`/${namespace}/index`, mode, contentUrl),
    getSearchData(mode, contentUrl),
  ]);

  return (
    <NamespaceFrame
      namespace={namespace}
      data={{ sharedConfig, ...search } as NamespaceData}
    >
      {children}
    </NamespaceFrame>
  );
}
