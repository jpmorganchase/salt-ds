
import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const Display1 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display1({ children, className, ...rest }, ref) {
  return (
    <Text
      as="span"
      styleAs="display1"
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});

export const Display2 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display2({ children, className, ...rest }, ref) {
  return (
    <Text
      as="span"
      styleAs="display2"
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});

export const Display3 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display3({ children, className, ...rest }, ref) {
  return (
    <Text
      as="span"
      styleAs="display3"
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});
