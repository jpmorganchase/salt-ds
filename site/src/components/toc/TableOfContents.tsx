import { TableOfContents as MosaicTOC } from "@jpmorganchase/mosaic-site-components";
import React, { ComponentPropsWithoutRef, useEffect } from "react";

// This component is needed to fix the TOC not picking up lazily loaded mdx from next-remote-mdx.
export function TableOfContents(
  props: ComponentPropsWithoutRef<typeof MosaicTOC>
) {
  const [showTOC, setShowTOC] = React.useState(false);

  useEffect(() => {
    const handle = window.requestIdleCallback(() => {
      setShowTOC(true);
    });
    return () => window.cancelIdleCallback(handle);
  }, []);

  if (!showTOC) {
    return null;
  }

  return <MosaicTOC {...props} />;
}
