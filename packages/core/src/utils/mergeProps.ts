import { clsx } from "clsx";
import { createChainedFunction } from "./createChainedFunction";

interface Props {
  [key: string]: any;
}

export function mergeProps(
  propsA: Props,
  propsB: Props
): Record<string, unknown> {
  const props = { ...propsA };

  Object.keys(propsB).forEach((key) => {
    let a = props[key];
    let b = propsB[key];

    if (
      typeof a === "function" &&
      typeof b === "function" &&
      key.indexOf("on") === 0
    ) {
      props[key] = createChainedFunction(a, b);
    } else if (
      typeof a === "string" &&
      typeof b === "string" &&
      key === "className"
    ) {
      props[key] = clsx(a, b);
    } else {
      props[key] = b ?? a;
    }
  });

  return props;
}
