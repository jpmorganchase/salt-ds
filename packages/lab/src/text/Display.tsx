import { makePrefixer } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { forwardRef } from "react";
import { Span } from "./Span";
import { TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export const Display1 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Display1({ children, className, ...rest }, ref) {
  return (
    <Span
      className={cx(className, withBaseName(`display1`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Span>
  );
});

export const Display2 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Display2({ children, className, ...rest }, ref) {
  return (
    <Span
      className={cx(className, withBaseName(`display2`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Span>
  );
});

export const Display3 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Display3({ children, className, ...rest }, ref) {
  return (
    <Span
      className={cx(className, withBaseName(`display3`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Span>
  );
});
