import { type Density, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useState } from "react";

const safeParseFloat = (target?: string) => Number.parseFloat(target || "0");

export const getWidth = (node: HTMLElement | null) => {
  if (node == null) {
    return 0;
  }

  const style = window.getComputedStyle(node);
  const margin =
    safeParseFloat(style.marginLeft) + safeParseFloat(style.marginRight);

  let dimension: DOMRect;

  if (style.display === "none") {
    const nodeDisplay = node.style.display;

    node.style.display = "inline-block";
    dimension = node.getBoundingClientRect();
    node.style.display = nodeDisplay;
  } else {
    dimension = node.getBoundingClientRect();
  }

  return dimension.width + margin;
};

/**
 * This records the width of a component when it's rendered
 */
export const useWidth = (
  density: Density,
  // biome-ignore lint/suspicious/noExplicitAny: any is simpler here.
): [(newNode: any) => void, number] => {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState<number>(0);

  useIsomorphicLayoutEffect(() => {
    if (node !== null && density) {
      setWidth(getWidth(node));
    }
  }, [node, density]);

  return [setNode, width];
};
