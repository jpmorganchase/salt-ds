import { useDensity, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useState } from "react";

/**
 * Resolves the panel's page-margin token to pixels for floating-ui padding, to
 * handle token (`--saltMegaMenuPanel-pageMargin`) override by consumers
 * (edge to edge example).
 */
export function usePageMargin(
  referenceEl: HTMLElement | null | undefined,
): number {
  const density = useDensity();
  const [pageMargin, setPageMargin] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: density isn't read here — signal that the resolved token changed.
  useIsomorphicLayoutEffect(() => {
    if (!referenceEl?.parentNode) return;
    const probe = referenceEl.ownerDocument.createElement("div");
    probe.style.cssText =
      "position:absolute;visibility:hidden;pointer-events:none;width:var(--saltMegaMenuPanel-pageMargin, var(--salt-layout-page-margin));";
    referenceEl.insertAdjacentElement("afterend", probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    setPageMargin((prev) => (prev === width ? prev : width));
  }, [referenceEl, density]);
  return pageMargin;
}
