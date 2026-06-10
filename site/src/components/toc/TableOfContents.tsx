import { H3, VerticalNavigation } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import styles from "./TableOfContents.module.css";
import { TableOfContentsItem } from "./TableOfContentsItem";

export type Item = { level: number; id: string; text: string };

export interface TableOfContentsProps
  extends ComponentPropsWithoutRef<"aside"> {
  items?: Item[];
}

// Fraction of the viewport below the sticky header that counts as the
// "reading zone": a heading becomes the active TOC entry once its top
// scrolls into (or above) this zone. ~1/3 of the viewport matches the
// pattern used by Vercel docs, MDN, Docusaurus etc. and corresponds to
// the lower edge of the IntersectionObserver "active band" those sites
// use — but driven by per-frame layout reads, which (unlike IO) keep
// working when MDX re-renders replace the heading DOM nodes.
const READING_ZONE_FRACTION = 0.33;

// Duration (ms) for which scroll-driven active updates are suppressed
// after a user clicks a TOC entry. Without this, the smooth-scroll
// animation triggered by the click fires many intermediate scroll
// events and the active highlight wipes through every heading between
// source and target before settling on the clicked one. ~600ms covers
// the typical browser smooth-scroll on a long page; the lock auto-
// expires so normal scroll-tracking resumes immediately after.
const CLICK_LOCK_MS = 600;

// CSS custom property consumed by `Base.module.css` `.content` to add
// just-enough `padding-bottom` so the page's last heading can scroll
// up to its `scroll-margin-top` offset. Always 0 unless the page is
// too short for the last heading to reach the top on its own — long
// pages get no visible empty space.
const RUNWAY_PROP = "--toc-scroll-runway";

export function TableOfContents(props: TableOfContentsProps) {
  const { items = [], className, ...rest } = props;
  const [activeId, setActiveId] = useState<string | null>(
    () => items[0]?.id ?? null,
  );
  const headingId = useId();
  // Timestamp (in `performance.now()` units) until which scroll-driven
  // updates should be ignored. A ref — not state — because mutating it
  // must NOT trigger a re-render of every TOC item on every click.
  const clickLockUntilRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) {
      return undefined;
    }

    let rafId: number | null = null;

    const computeActiveId = (): string | null => {
      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const threshold =
        headerHeight + window.innerHeight * READING_ZONE_FRACTION;

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
      // Honour the click-lock window: while a click-triggered smooth-
      // scroll is in flight, the user's intent is unambiguous — they
      // want the clicked heading active — so ignore the dozens of
      // intermediate scroll events the animation produces.
      if (performance.now() < clickLockUntilRef.current) return;
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

    // Add only the runway the page actually needs. Without this, the
    // browser clamps `window.scrollTo` for the last heading on short
    // pages — the click "works" but the heading stops short of its
    // `scroll-margin-top` position and the user sees nothing happen.
    //
    //   pixelsBelowLast = naturalDocHeight - lastAbsTop
    //   requiredRunway  = viewportH - scrollMarginTop
    //   shortfall       = max(0, required - pixelsBelowLast)
    //
    // `naturalDocHeight` subtracts any runway we previously applied so
    // the calculation converges in one step instead of oscillating.
    const adjustScrollRunway = () => {
      const root = document.documentElement;
      const lastEl = document.getElementById(items[items.length - 1].id);
      if (!lastEl) return;

      const currentRunway =
        Number.parseFloat(
          getComputedStyle(root).getPropertyValue(RUNWAY_PROP),
        ) || 0;
      const naturalDocHeight = root.scrollHeight - currentRunway;
      const lastAbsTop = lastEl.getBoundingClientRect().top + window.scrollY;
      const scrollMarginTop =
        Number.parseFloat(getComputedStyle(lastEl).scrollMarginTop) || 0;

      const pixelsBelowLast = naturalDocHeight - lastAbsTop;
      const requiredRunway = window.innerHeight - scrollMarginTop;
      const shortfall = Math.max(0, requiredRunway - pixelsBelowLast);

      // Only write when the value actually changes — avoids style
      // recalc churn and removes the only realistic vector for a
      // ResizeObserver feedback loop should one be added later.
      if (Math.abs(shortfall - currentRunway) >= 1) {
        root.style.setProperty(RUNWAY_PROP, `${Math.ceil(shortfall)}px`);
      }
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
        adjustScrollRunway();
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

    // Recompute runway when the viewport changes — `scroll-margin-top`
    // and `viewportH` are both viewport-dependent. Scroll events don't
    // affect runway, so we only attach it to resize.
    const handleResize = () => {
      schedule();
      adjustScrollRunway();
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", handleResize);
      mutationObserver?.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      // Drop the runway so the next page (which may not have a TOC, or
      // may be longer / shorter) starts from a clean baseline.
      document.documentElement.style.removeProperty(RUNWAY_PROP);
    };
  }, [items]);

  // Click handler shared with every TableOfContentsItem. Stable across
  // renders so item memoisation (if added later) isn't defeated.
  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    clickLockUntilRef.current = performance.now() + CLICK_LOCK_MS;
  }, []);

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
            onSelect={handleSelect}
          />
        ))}
      </VerticalNavigation>
    </aside>
  );
}
