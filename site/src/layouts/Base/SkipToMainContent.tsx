import { type MouseEvent, useEffect } from "react";
import styles from "./Base.module.css";

export function SkipToMainContent({ targetId }: { targetId: string }) {
  useEffect(() => {
    function clearFocusTarget() {
      document.getElementById(targetId)?.removeAttribute("tabindex");
    }

    // A page can enter the back-forward cache without blurring main first.
    window.addEventListener("pagehide", clearFocusTarget);
    return () => window.removeEventListener("pagehide", clearFocusTarget);
  }, [targetId]);

  function focusMain(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    // A permanently focusable main can interfere with iOS Safari's Back scroll.
    target.tabIndex = -1;
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
      once: true,
    });
    target.focus({ preventScroll: true });
    target.scrollIntoView();
  }

  return (
    <a className={styles.skipLink} href={`#${targetId}`} onClick={focusMain}>
      Skip to main content
    </a>
  );
}
