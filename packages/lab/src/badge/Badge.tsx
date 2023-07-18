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

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { value, max, className, children, ...rest },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-badge",
    css: badgeCss,
    window: targetWindow,
  });

  let valueText = value;

  if (typeof value === "number" && max) {
    valueText = value > max ? `${max}+` : value;
  } else if (typeof value === "string") {
    valueText = value.length > 4 ? `${value.slice(0, 4)}...` : value;
  }

  if (!children) {
    return (
      <div>
        <span
          className={clsx(withBaseName(), withBaseName("inline"), className)}
          ref={ref}
          {...rest}
        >
          {valueText}
        </span>
      </div>
    );
  } else
    return (
      <span
        className={clsx(withBaseName("wrap"), className)}
        ref={ref}
        {...rest}
      >
        {children}
        <span
          className={clsx(withBaseName(), withBaseName(`topRight`), className)}
        >
          {valueText}
        </span>
      </span>
    );
});
