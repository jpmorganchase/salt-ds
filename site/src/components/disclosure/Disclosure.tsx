import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { type FC, type ReactNode, useEffect, useRef } from "react";
import styles from "./Disclosure.module.css";

interface DisclosureProps {
  /**
   * Label shown on the clickable summary row. Pass a string for the common
   * case, or JSX (e.g. `<>View the <code>@font-face</code> declarations</>`)
   * when inline formatting is needed.
   */
  summary: ReactNode;
  children: ReactNode;
  /** Render the disclosure expanded on first paint. */
  defaultOpen?: boolean;
  /** Optional id for deep-linking — `?#my-disclosure` will scroll to it. */
  id?: string;
}

/**
 * Lightweight collapsible block built on the native `<details>` element.
 *
 * Why not Salt's `Accordion`?
 * - Native `<details>` content is searchable by the browser's find-in-page
 *   (Ctrl/Cmd+F), which auto-expands the disclosure when the search matches
 *   hidden text. JS-driven accordions hide content via `display: none` and
 *   silently break search.
 * - Keyboard, focus and screen-reader behaviour are correct by default.
 * - Works without JavaScript (progressive enhancement / SSR).
 *
 * Reserve `<Accordion>` for documenting the Accordion component itself.
 */
export const Disclosure: FC<DisclosureProps> = ({
  summary,
  children,
  defaultOpen,
  id,
}) => {
  const ref = useRef<HTMLDetailsElement>(null);

  // Auto-expand when the URL hash targets this disclosure. Native <details>
  // does this for find-in-page but not for hash navigation, so deep-links
  // like /themes#using-the-legacy-uitk-theme would otherwise land on a
  // collapsed item. Imperative mutation avoids switching <details> from
  // uncontrolled to controlled (which would warn + require click tracking).
  //
  // We deliberately do NOT call scrollIntoView here: the browser has already
  // scrolled to the target (either via initial hash navigation or by the
  // hashchange-driving anchor click), and opening the disclosure grows it
  // downward without moving its top edge. Calling scrollIntoView would (1)
  // cancel any in-flight smooth scroll and snap instantly, and (2) measure
  // the element mid-transition while its height is still animating.
  useEffect(() => {
    if (!id) return;

    const openIfTargeted = () => {
      const element = ref.current;
      if (!element || element.open) return;
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (hash === id) {
        element.open = true;
      }
    };

    openIfTargeted();
    window.addEventListener("hashchange", openIfTargeted);
    return () => {
      window.removeEventListener("hashchange", openIfTargeted);
    };
  }, [id]);

  return (
    <details ref={ref} className={styles.root} open={defaultOpen} id={id}>
      <summary className={styles.summary}>
        {/* Matches Salt Accordion's semantic icons: ExpandIcon (ChevronDown)
            when closed, CollapseIcon (ChevronUp) when open. Both are rendered
            and toggled via CSS so the indicator stays correct without JS. */}
        <ChevronDownIcon
          aria-hidden
          className={`${styles.icon} ${styles.iconClosed}`}
        />
        <ChevronUpIcon
          aria-hidden
          className={`${styles.icon} ${styles.iconOpen}`}
        />
        <span className={styles.summaryText}>{summary}</span>
      </summary>
      <div className={styles.panel}>{children}</div>
    </details>
  );
};
