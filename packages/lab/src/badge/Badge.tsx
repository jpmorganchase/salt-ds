import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { MessageIcon } from "@salt-ds/icons";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import badgeCss from "./Badge.css";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The number to display on the badge
   */
  value: number;
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

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { value, max = 100, className, children, ...rest },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-badge",
    css: badgeCss,
    window: targetWindow,
  });

  const valueText = value > max ? `${max}+` : value;
  const size = value ? "withValue" : "noValue";

  return (
    <span className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {children}
      <span
        className={clsx(
          withBaseName("position"),
          withBaseName(`${size}`),
          className
        )}
      >
        {valueText}
      </span>
    </span>
  );
});
