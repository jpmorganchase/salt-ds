import { forwardRef, SVGAttributes } from "react";
import cx from "classnames";

import "./Icon.css";

// Duplicate from core/util to avoid circular dependency
export const makePrefixer =
  (prefix: string): ((...names: string[]) => string) =>
  (...names: string[]): string =>
    [prefix, ...names].join("-");

const withBaseName = makePrefixer("uitkIcon");

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  /**
   * Multiplier for the base icon size. Should be an integer to conform to the rest of the design system
   */
  size?: number;
}

export const DEFAULT_ICON_SIZE = 1;

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { children, className, size = DEFAULT_ICON_SIZE, style: styleProp, ...rest },
  ref
) {
  const style = {
    ...styleProp,
    "--uitkIcon-size-multiplier": `${size}`,
  };

  return (
    <svg
      className={cx(withBaseName(), className)}
      style={style}
      role="img"
      {...rest}
      ref={ref}
    >
      <g aria-hidden>{children}</g>
    </svg>
  );
});
