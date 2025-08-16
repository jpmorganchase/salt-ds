import { useTableOfContents } from "@jpmorganchase/mosaic-store";
import { H3, NavigationItem, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./TableOfContents.module.css";

const stripMarkdownLinks = (text: string) =>
  text.replace(/\[([^[\]]*)\]\((.*?)\)/gm, "$1");

function getHeaderAnchors(): HTMLAnchorElement[] {
  // Some layout (e.g. components) has multiple tabs with hidden headings
  const visibleTabPanel = document.querySelector(
    '[role="tabpanel"]:not([hidden])',
  );

  return Array.from(
    (visibleTabPanel ?? document).querySelectorAll('[data-mdx="heading2"]'),
  ).map((testElement) => {
    return testElement.parentNode as HTMLAnchorElement;
  });
}

const TOP_OFFSET = 80; /** Header height */

function useTocHighlight(topOffset = TOP_OFFSET) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function updateActiveLink() {
      const pageHeight = document.body.scrollHeight;
      const scrollPosition = window.scrollY + window.innerHeight;
      const headersAnchors = getHeaderAnchors();

      if (scrollPosition >= 0 && pageHeight - scrollPosition <= 0) {
        // Scrolled to bottom of page.
        setCurrentIndex(headersAnchors.length - 1);
        return;
      }

      let index = -1;
      while (index < headersAnchors.length - 1) {
        const headerAnchor = headersAnchors[index + 1];
        const { top } = headerAnchor.getBoundingClientRect();

        if (top >= topOffset) {
          break;
        }
        index += 1;
      }

      setCurrentIndex(Math.max(index, 0));
    }

    function throttledUpdateActiveLink() {
      if (timeoutRef.current === null) {
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null;
          updateActiveLink();
        }, 100);
      }
    }

    document.addEventListener("scroll", throttledUpdateActiveLink);
    document.addEventListener("resize", throttledUpdateActiveLink);

    updateActiveLink();

    return () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      document.removeEventListener("scroll", throttledUpdateActiveLink);
      document.removeEventListener("resize", throttledUpdateActiveLink);
    };
  }, [topOffset]);

  return {
    currentIndex,
  };
}

// This component is needed to fix the TOC not picking up lazily loaded mdx from next-remote-mdx.
export function TableOfContents(props: ComponentPropsWithoutRef<"aside">) {
  const { className, ...rest } = props;
  const { tableOfContents } = useTableOfContents();
  const [showTOC, setShowTOC] = useState(false);
  const headingId = useId();

  const { currentIndex } = useTocHighlight();

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
    <nav
      aria-labelledby={headingId}
      className={clsx(styles.root, className)}
      {...rest}
    >
      <H3 className={styles.heading} id={headingId}>
        On this page
      </H3>
      <ul className={styles.list}>
        {tableOfContents.map((item, index) => (
          <li key={item.id}>
            <NavigationItem
              orientation="vertical"
              href={`#${item.id}`}
              level={item.level}
              active={currentIndex === index}
            >
              {stripMarkdownLinks(item.text)}
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );
}
