import { useTableOfContents } from "@jpmorganchase/mosaic-store";
import { NavigationItem, useId } from "@salt-ds/core";
import clsx from "clsx";
import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import styles from "./TableOfContents.module.css";

const stripMarkdownLinks = (text: string) =>
  text.replace(/\[([^[\]]*)\]\((.*?)\)/gm, "$1");

// This component is needed to fix the TOC not picking up lazily loaded mdx from next-remote-mdx.
export function TableOfContents(props: ComponentPropsWithoutRef<"aside">) {
  const { className, ...rest } = props;
  const { tableOfContents } = useTableOfContents();
  const [showTOC, setShowTOC] = useState(false);
  const headingId = useId();

  useEffect(() => {
    const handle = window.requestIdleCallback(() => {
      setShowTOC(true);
    });
    return () => window.cancelIdleCallback(handle);
  }, []);

  if (!showTOC || tableOfContents.length === 0) {
    return null;
  }

  return (
    <aside
      className={clsx("salt-density-medium", styles.root, className)}
      {...rest}
    >
      <span className={styles.heading} id={headingId}>
        On this page
      </span>
      <ul aria-labelledby={headingId} className={styles.list}>
        {tableOfContents.map((item) => (
          <li key={item.id}>
            <NavigationItem
              orientation="vertical"
              href={`#${item.id}`}
              level={item.level}
            >
              {stripMarkdownLinks(item.text)}
            </NavigationItem>
          </li>
        ))}
      </ul>
    </aside>
  );
}
