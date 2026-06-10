import {
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import type { CSSProperties, MouseEvent } from "react";
import type { Item } from "./TableOfContents";
import { stripMarkdownLinks } from "./utils";

export function TableOfContentsItem({
  item,
  current,
  onSelect,
}: {
  item: Item;
  current?: string;
  onSelect?: (id: string) => void;
}) {
  const selected = item.id === current;

  const handleItemClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(item.id);
    const hash = `#${item.id}`;

    // Respect users with vestibular sensitivities: skip the smooth-scroll
    // animation when the OS-level `prefers-reduced-motion` is set.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (target) {
      // Read the heading's own `scroll-margin-top` so the JS-driven
      // scroll lands at *exactly* the same offset the browser would use
      // for a native hash navigation (which honours scroll-margin-top
      // automatically). This keeps click-to-scroll consistent with
      // deep-link / page-reload behaviour and avoids hard-coding the
      // header height in two places.
      const scrollMarginTop =
        Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - scrollMarginTop;

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });

      // Keyboard a11y: move focus to the heading we just scrolled to so
      // keyboard / screen-reader users continue reading from there rather
      // than from inside the TOC. Headings aren't focusable by default,
      // so make the element programmatically focusable on demand.
      // `preventScroll` stops the browser from snapping past the in-flight
      // smooth scroll above.
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    }

    // Eagerly tell the parent which item is now active. The parent uses
    // this to (a) paint the indicator immediately — no waiting for the
    // smooth-scroll to finish — and (b) open a short "click-lock"
    // window during which scroll-driven updates are suppressed, so the
    // active highlight doesn't wipe through intermediate headings as
    // the animation passes them.
    onSelect?.(item.id);

    if (window.history.pushState) {
      window.history.pushState(null, "", hash);
    } else {
      window.location.hash = hash;
    }
  };

  // Salt's `VerticalNavigationItem` indents children via the
  // `--verticalNavigationItem-depth` CSS variable, normally set by
  // `VerticalNavigationSubMenu` nesting. For a flat TOC we drive
  // indentation directly from the heading level (h1=1 -> depth 0,
  // h2=2 -> depth 1, ...) so deeper headings stay visually nested.
  const depthStyle = {
    "--verticalNavigationItem-depth": Math.max(item.level - 1, 0),
  } as CSSProperties;

  return (
    <VerticalNavigationItem active={selected} style={depthStyle}>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger
          href={`#${item.id}`}
          onClick={handleItemClick}
          // Override Salt's hard-coded `aria-current="page"`: a TOC link
          // targets a section *within* the current page, not a different
          // page, so ARIA 1.2's `"location"` token is the semantically
          // correct value.
          aria-current={selected ? "location" : undefined}
        >
          <VerticalNavigationItemLabel>
            {stripMarkdownLinks(item.text)}
          </VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}
