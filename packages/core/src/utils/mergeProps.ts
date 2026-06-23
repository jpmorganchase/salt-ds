import { clsx } from "clsx";
import { createChainedFunction } from "./createChainedFunction";

interface Props {
  [key: string]: unknown;
}

/**
 * This utility merges two prop objects according to the following rules:
 *
 * - If the prop is a function and begins with "on" then chain the functions together
 * - If the prop key is "className" then merge them using `clsx`
 * - If the prop key is "style" and both values are objects then shallow-merge them
 *   (values from the second parameter win on key conflicts). This preserves CSS
 *   custom properties set internally by the component (e.g. `--saltAvatar-size-multiplier`)
 *   when a consumer passes their own `style` via a render prop.
 * - If the prop is anything else, then use the value from the second parameter unless it's undefined then use the value from the first parameter
 */
export function mergeProps(
  propsA: Props,
  propsB: Props,
): Record<string, unknown> {
  const props = { ...propsA };

  for (const key of Object.keys(propsB)) {
    const a: any = props[key];
    const b: any = propsB[key];

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
    } else if (
      key === "style" &&
      typeof a === "object" &&
      a !== null &&
      typeof b === "object" &&
      b !== null
    ) {
      props[key] = { ...a, ...b };
    } else {
      props[key] = b !== undefined ? b : a;
    }
  }

  return props;
}
