import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { makePrefixer } from "../utils";

import badgeCss from "./Badge.css";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The number to display on the badge. If `value` is not provided,
   * the badge will render as a dot badge.
   */
  value?: number | string;
  /**
   * If a child is provided the Badge will render top right. By defualt renders inline.
   */
  children?: ReactNode;
  /**
   * The max number to display on the badge.
   */
  max?: number;
}
const withBaseName = makePrefixer("saltBadge");

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { value, max = 999, className, children, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-badge",
    css: badgeCss,
    window: targetWindow,
  });

  const valueText =
    typeof value === "number" && value > max ? `${max}+` : value;

  const dotBadge = typeof value === "undefined";

  return (
    <span className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {children}
      <span
        className={clsx(withBaseName("badge"), {
          [withBaseName("topRight")]: children,
          [withBaseName("dotBadge")]: dotBadge,
        })}
      >
        {valueText}
      </span>
    </span>
  );
});
