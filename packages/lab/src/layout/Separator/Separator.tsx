import { CSSProperties, forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@brandname/core";
import "./Separator.css";
import cx from "classnames";

const withBaseName = makePrefixer("uitkSeparator");

export const HORIZONTAL_SEPARATOR_VARIANTS = [
  "horizontal-start",
  "horizontal-center",
  "horizontal-end",
  "empty-space",
];
export const VERTICAL_SEPARATOR_VARIANTS = [
  "vertical-start",
  "vertical-center",
  "vertical-end",
  "empty-space",
];
export const SEPARATOR_VARIANTS = [
  ...HORIZONTAL_SEPARATOR_VARIANTS,
  ...VERTICAL_SEPARATOR_VARIANTS,
];
export type SeparatorVariant = typeof SEPARATOR_VARIANTS[number];

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  width?: number;
  variant?: SeparatorVariant;
  /**
   * The className(s) of the component.
   */
  className?: string;
  style?: CSSProperties;
  stretch?: boolean;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    { className, style, variant = "empty-space", stretch, ...rest },
    ref
  ) {
    const hasVariant = variant && variant !== "empty-space";
    return (
      <div
        className={cx(className, withBaseName(), {
          [withBaseName(variant.split("-")[0])]: hasVariant,
          [withBaseName(variant)]: hasVariant,
          [withBaseName("stretch")]: stretch,
        })}
        style={style}
        ref={ref}
        {...rest}
      />
    );
  }
);
