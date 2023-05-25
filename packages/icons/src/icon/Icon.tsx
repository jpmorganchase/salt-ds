import { forwardRef, SVGAttributes } from "react";
import { clsx } from "clsx";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import iconCss from "./Icon.css";
// Duplicate from core/util to avoid circular dependency
export const makePrefixer =
  (prefix: string): ((...names: string[]) => string) =>
  (...names: string[]): string =>
    [prefix, ...names].join("-");

const withBaseName = makePrefixer("saltIcon");

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  /**
   * Multiplier for the base icon size. Should be a positive integer to conform to the rest of the design system.
   */
  size?: number;
}

export const DEFAULT_ICON_SIZE = 1;

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { children, className, size = DEFAULT_ICON_SIZE, style: styleProp, ...rest },
  ref
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
      className={clsx(withBaseName(), className)}
      style={style}
      role="img"
      {...rest}
      ref={ref}
    >
      <g aria-hidden>{children}</g>
    </svg>
  );
});
