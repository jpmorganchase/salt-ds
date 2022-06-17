import { makePrefixer } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { forwardRef } from "react";
import { Span } from "./Span";
import { TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export const Figure1 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Figure1({ children, className, ...rest }, ref) {
  return (
    <Span
      className={cx(className, withBaseName(`figure1`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Span>
  );
});

export const Figure2 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Figure2({ children, className, ...rest }, ref) {
  return (
    <Span
      className={cx(className, withBaseName(`figure2`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Span>
  );
});

export const Figure3 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Figure3({ children, className, ...rest }, ref) {
  return (
    <Span
      className={cx(className, withBaseName(`figure3`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Span>
  );
});
