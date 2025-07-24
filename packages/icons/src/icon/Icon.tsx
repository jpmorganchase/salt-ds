import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type SVGAttributes } from "react";

import iconCss from "./Icon.css";
// Duplicate from core/util to avoid circular dependency
export const makePrefixer =
  (prefix: string): ((...names: string[]) => string) =>
  (...names: string[]): string =>
    [prefix, ...names].join("-");

const withBaseName = makePrefixer("saltIcon");

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  /*
   * The color of the icon. Defaults to "inherit".
   */
  color?: "inherit" | "primary" | "secondary";
  /**
   * Multiplier for the base icon size. Should be a positive integer to conform to the rest of the design system.
   */
  size?: number;
}

export const DEFAULT_ICON_SIZE = 1;

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    "aria-hidden": ariaHidden,
    "aria-label": ariaLabel,
    children,
    className,
    color = "inherit",
    size = DEFAULT_ICON_SIZE,
    style: styleProp,
    ...rest
  },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-icon",
    css: iconCss,
    window: targetWindow,
  });

  const style = {
    ...styleProp,
    "--saltIcon-size-multiplier": `${size}`,
  };

  return (
    <svg
      className={clsx(
        withBaseName(),
        { [withBaseName(color)]: color !== "inherit" },
        className,
      )}
      style={style}
      // Workaround to fix aria labels being announced even when aria-hidden is set to true on iOS.
      role={ariaHidden ? undefined : "img"}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-hidden={ariaHidden}
      {...rest}
      ref={ref}
    >
      <g aria-hidden>{children}</g>
    </svg>
  );
});
