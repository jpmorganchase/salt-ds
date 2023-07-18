import { makePrefixer, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import badgeCss from "./Badge.css";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The number to display on the badge
   */
  value?: number | string;
  /**
   * The badge will be added relative to this node. Renders the "message" icon by default.
   */
  children?: ReactNode;
  /**
   * The max number to display on the badge.
   */
  max?: number;
}

const withBaseName = makePrefixer("saltBadge");
let valueText: ReactNode;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { value, max = 5, className, children, ...rest },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-badge",
    css: badgeCss,
    window: targetWindow,
  });

  //truncate according to value type
  if (typeof value === "number") {
    valueText = value > max ? `${max}+` : value;
  } else if (typeof value === "string") {
    valueText = value.slice(0, 4);
  }

  return (
    <span className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {children}
      <span className={clsx(withBaseName("badge"), className)}>
        {valueText}
      </span>
    </span>
  );
});
