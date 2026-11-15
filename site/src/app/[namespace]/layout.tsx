import {
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
  const sharedConfig = await getSharedConfig(
    `/${namespace}/index`,
    mode,
    contentUrl,
  );

  return (
    <NamespaceFrame
      namespace={namespace}
      data={{ sharedConfig } as NamespaceData}
    >
      {children}
    </NamespaceFrame>
  );
}
