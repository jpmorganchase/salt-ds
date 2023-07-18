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

  //truncate according to value type
  if (typeof value === "number" && max) {
    valueText = value > max ? `${max}+` : value;
  }

  if (!children) {
    //This is the most basic form of the badge inline
    return (
      <span
        className={clsx(withBaseName(), withBaseName("badge"), className)}
        ref={ref}
        {...rest}
      >
        {valueText}
      </span>
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
          //top right styling for when there is a child
          className={clsx(withBaseName(), withBaseName(`topRight`), className)}
        >
          {valueText}
        </span>
      </span>
    );
});
