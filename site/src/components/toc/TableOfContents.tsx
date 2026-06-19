import { H3, VerticalNavigation } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  useEffect,
  useId,
  useState,
} from "react";
import styles from "./TableOfContents.module.css";
import { TableOfContentsItem } from "./TableOfContentsItem";

export type Item = { level: number; id: string; text: string };

export interface TableOfContentsProps
  extends ComponentPropsWithoutRef<"aside"> {
  items?: Item[];
}

// Fraction of the viewport that counts as the "reading zone": a heading
// becomes the active TOC entry once its top scrolls into (or above) this
// zone.
const READING_ZONE_FRACTION = 0.33;

export function TableOfContents(props: TableOfContentsProps) {
  const { items = [], className, ...rest } = props;
  const [activeId, setActiveId] = useState<string | null>(
    () => items[0]?.id ?? null,
  );
  const headingId = useId();

  useEffect(() => {
    if (items.length === 0) return undefined;

    let rafId: number | null = null;

    const computeActiveId = (): string | null => {
      const threshold = window.innerHeight * READING_ZONE_FRACTION;

      // Walk headings in document order: the active one is the last
      // heading that has scrolled up into (or above) the reading-zone
      // threshold. Items further down haven't been reached yet, so we
      // can stop early.
      let lastPassed: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top < threshold) {
          lastPassed = item.id;
        } else {
          break;
        }
      }

      // Bottom-of-page fallback: when the reader has scrolled as far as
      // the page allows, the last heading is the one being read even if
      // its top hasn't crossed the reading-zone threshold (e.g. short
      // final section). The 4px slack absorbs subpixel scroll positions
      // on hi-DPI / zoomed displays.
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) {
        // Only override `lastPassed` when the previously-passed heading
        // has scrolled off the top of the viewport. Otherwise the page
        // is just barely scrollable (or not scrollable at all) and
        // `atBottom` is incidental — the active heading is whatever the
        // reading-zone logic already picked. Without this guard, deep-
        // linking to a heading on a short page (e.g. `#lab-components`
        // when the document fits within ~1 viewport) would always snap
        // the active state to the final entry.
        if (lastPassed === null) return items[items.length - 1].id;
        const lastPassedEl = document.getElementById(lastPassed);
        if (lastPassedEl && lastPassedEl.getBoundingClientRect().top < 0) {
          return items[items.length - 1].id;
        }
      }

      return lastPassed;
    };

    const refreshActive = () => {
      const next = computeActiveId();
      if (next !== null) setActiveId(next);
    };

    // RAF-throttle scroll/resize so we do at most one layout read per
    // frame regardless of how often the browser fires the event.
    const schedule = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        refreshActive();
      });
    };

    // Initial measurement — MDX is lazy-loaded by next-remote-mdx so
    // the headings may not be in the DOM on the first tick. A
    // MutationObserver retries on subtree changes until at least one
    // heading appears, then disconnects.
    let mutationObserver: MutationObserver | null = null;
    const tryInitialMeasure = (): boolean => {
      const anyPresent = items.some((item) => document.getElementById(item.id));
      if (anyPresent) {
        refreshActive();
        return true;
      }
      return false;
    };
    if (!tryInitialMeasure()) {
      mutationObserver = new MutationObserver(() => {
        if (tryInitialMeasure()) {
          mutationObserver?.disconnect();
          mutationObserver = null;
        }
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mutationObserver?.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className={clsx(styles.root, className)} {...rest}>
      <H3 className={styles.heading} id={headingId}>
        On this page
      </H3>
      <VerticalNavigation
        appearance="indicator"
        aria-labelledby={headingId}
        className={styles.nav}
        data-testid="table-of-contents"
      >
        {items.map((item) => (
          <TableOfContentsItem
            key={item.id}
            current={activeId ?? undefined}
            item={item}
          />
        ))}
      </VerticalNavigation>
    </aside>
  );
}
