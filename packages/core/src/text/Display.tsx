import { makePrefixer } from "../utils";
import cx from "classnames";
import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export const Display1 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Display1({ children, className, ...rest }, ref) {
  return (
    <Text
      elementType="span"
      className={cx(className, withBaseName(`display1`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});

export const Display2 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Display2({ children, className, ...rest }, ref) {
  return (
    <Text
      elementType="span"
      className={cx(className, withBaseName(`display2`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});

export const Display3 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Display3({ children, className, ...rest }, ref) {
  return (
    <Text
      elementType="span"
      className={cx(className, withBaseName(`display3`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});
