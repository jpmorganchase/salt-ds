import { useState } from "react";
import { Density, useIsomorphicLayoutEffect } from "@salt-ds/core";

const safeParseFloat = (target?: string) => parseFloat(target || "0");

export const getPadding = (node: HTMLElement | null) => {
  if (node == null) {
    return 0;
  }
  const style = window.getComputedStyle(node);
  const padding =
    safeParseFloat(style.paddingLeft) + safeParseFloat(style.paddingRight);
  return padding;
};

export const getWidth = (node: HTMLElement | null) => {
  if (node == null) {
    return 0;
  }

  const style = window.getComputedStyle(node);
  const margin =
    safeParseFloat(style.marginLeft) + safeParseFloat(style.marginRight);

  let dimension;

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
  density: Density
): [(newNode: any) => void, number] => {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState<number>(0);

  useIsomorphicLayoutEffect(() => {
    if (node !== null) {
      setWidth(getWidth(node));
    }
  }, [node, density]);

  return [setNode, width];
};
