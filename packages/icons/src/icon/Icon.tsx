import {
  forwardRef,
  HTMLAttributes,
  cloneElement,
  isValidElement,
  SVGAttributes,
} from "react";
import cx from "classnames";

import "./Icon.css";

// Duplicate from core/util to avoid circular dependency
export const makePrefixer =
  (prefix: string): ((...names: string[]) => string) =>
  (...names: string[]): string =>
    [prefix, ...names].join("-");

export const ICON_NAMED_SIZES = ["small", "medium", "large"] as const;

const withBaseName = makePrefixer("uitkIcon");

export type IconSize = typeof ICON_NAMED_SIZES[number];

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Pass props to the underlying svg element.
   */
  SVGProps?: Partial<SVGAttributes<SVGSVGElement>>;
  /**
   * Size of the icon, explicit size or small/medium/large
   */
  size?: IconSize | number;
}

export const DEFAULT_ICON_SIZE = "small";

export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  {
    children,
    className,
    size = DEFAULT_ICON_SIZE,
    style: styleProp,
    SVGProps,
    ...rest
  },
  ref
) {
  const isNamedSize = ICON_NAMED_SIZES.indexOf(size as IconSize) !== -1;

  const style = isNamedSize
    ? styleProp
    : {
        ...styleProp,
        "--uitkIcon-size": `${size}px`,
      };

  return (
    <>
      {isValidElement(children)
        ? cloneElement(children, {
            ref,
            style,
            className: cx(className, withBaseName(), {
              [withBaseName(size as string)]: isNamedSize,
            }),
            ...SVGProps,
            ...rest,
          })
        : children}
    </>
  );
});
