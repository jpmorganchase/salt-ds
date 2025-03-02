import { TableOfContents as MosaicTOC } from "@jpmorganchase/mosaic-site-components";
import clsx from "clsx";
import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import styles from "./TableOfContents.module.css";

// This component is needed to fix the TOC not picking up lazily loaded mdx from next-remote-mdx.
export function TableOfContents(
  props: ComponentPropsWithoutRef<typeof MosaicTOC> & { className?: string },
) {
  const [showTOC, setShowTOC] = useState(false);

  useEffect(() => {
    const handle = window.requestIdleCallback(() => {
      setShowTOC(true);
    });
    return () => window.cancelIdleCallback(handle);
  }, []);

  if (!showTOC) {
    return null;
  }

  const { className, ...rest } = props;

  return (
    <aside className={clsx("salt-density-medium", styles.root, className)}>
      <MosaicTOC {...rest} />
    </aside>
  );
}
