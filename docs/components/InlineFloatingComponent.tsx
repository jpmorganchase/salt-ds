import type { FloatingComponentProps } from "@salt-ds/core";
import { forwardRef } from "react";

/**
 * Renders a floating component in place instead of portalling it to the body,
 * so QA stories can show several open at once. Use with `FloatingComponentProvider`.
 */
export const InlineFloatingComponent = forwardRef<
  HTMLDivElement,
  FloatingComponentProps
>(function InlineFloatingComponent(props, ref) {
  const {
    open,
    focusManagerProps,
    lockScroll,
    top,
    left,
    position,
    width,
    height,
    ...rest
  } = props;
  return open ? <div ref={ref} {...rest} /> : null;
});
