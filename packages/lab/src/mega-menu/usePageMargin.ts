import { debounce } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useEffect, useState } from "react";

/**
 * Resolve the mega menu panel's page-margin to a pixel number, re-measuring on
 * a (debounced) window resize. Consumed by `MegaMenuPanel` as the `flip` /
 * `shift` / `size` middleware padding.
 *
 * **Why a probe rather than `getComputedStyle`?** The page-margin custom
 * property is **calc-based** — `--salt-layout-page-margin` resolves to e.g.
 * `calc(3 * 8px)`. `getComputedStyle(host).getPropertyValue("--salt-layout-page-margin")`
 * returns the *unresolved* token string (`"calc(3 * 8px)"`), so
 * `Number.parseFloat` yields `NaN` and the margin silently collapses to 0.
 * Browsers only resolve a calc-based custom property when it is applied to a
 * real, laid-out property of a real element. So the principled way to read its
 * px value is to apply the var to a hidden element's `width` and read the
 * resulting `getBoundingClientRect().width` back. This is the same probe that
 * shipped originally — isolated and documented here, not a behavior change.
 *
 * The `--saltMegaMenuPanel-pageMargin` → `--salt-layout-page-margin`
 * override/fallback chain is preserved in the probe's `width` declaration.
 *
 * @param host element the probe is appended to so it inherits the correct
 *   cascade (the trigger's `domReference`), falling back to `document.body`.
 * @returns the resolved page margin in pixels (`0` until first measured / SSR).
 */
export function usePageMargin(host: HTMLElement | null): number {
  const targetWindow = useWindow();
  const [pageMargin, setPageMargin] = useState(0);

  useEffect(() => {
    if (!targetWindow) return;
    const doc = targetWindow.document;
    const measureHost = host ?? doc.body;

    const measure = () => {
      const probe = doc.createElement("div");
      // Apply the (calc-based) page-margin var to a laid-out property so the
      // browser resolves it; the computed width is then the px value. Keeps the
      // --saltMegaMenuPanel-pageMargin → --salt-layout-page-margin chain.
      probe.style.cssText =
        "position:absolute;visibility:hidden;pointer-events:none;width:var(--saltMegaMenuPanel-pageMargin, var(--salt-layout-page-margin));";
      measureHost.appendChild(probe);
      const width = probe.getBoundingClientRect().width;
      probe.remove();
      setPageMargin((prev) => (prev === width ? prev : width));
    };

    measure();
    const onResize = debounce(measure);
    targetWindow.addEventListener("resize", onResize);
    return () => {
      onResize.clear();
      targetWindow.removeEventListener("resize", onResize);
    };
  }, [targetWindow, host]);

  return pageMargin;
}
