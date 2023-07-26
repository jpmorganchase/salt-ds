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

  if (typeof value === "number" && !max) {
    valueText = value > 999 ? "999+" : value;
  } else if (typeof value === "number" && max) {
    valueText = value > max ? `${max}+` : value;
  } else if (typeof value === "string") {
    valueText = value.length > 4 ? `${value.slice(0, 4)}...` : value;
  }
  return (
    <span className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {children}
      {typeof value === "string" && value.length > 4 ? (
        <>
          <span
            className={clsx(withBaseName("badge"), {
              [withBaseName("topRight")]: children,
            })}
            aria-hidden="true"
          >
            {valueText}
          </span>
          <span className="salt-visuallyHidden">{value}</span>
        </>
      ) : (
        <span
          className={clsx(withBaseName("badge"), {
            [withBaseName("topRight")]: children,
          })}
        >
          {valueText}
        </span>
      )}
    </span>
  );
});
