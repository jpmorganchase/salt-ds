import { forwardRef } from "react";

import { Text, TextProps } from "./Text";

export const H1 = forwardRef<
  HTMLHeadingElement,
  Omit<TextProps, "elementType">
>(function H1({ children, ...rest }, ref) {
  return (
    <Text elementType="h1" ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const H2 = forwardRef<
  HTMLHeadingElement,
  Omit<TextProps, "elementType">
>(function H2({ children, ...rest }, ref) {
  return (
    <Text elementType="h2" ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const H3 = forwardRef<
  HTMLHeadingElement,
  Omit<TextProps, "elementType">
>(function H3({ children, ...rest }, ref) {
  return (
    <Text elementType="h3" ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const H4 = forwardRef<
  HTMLHeadingElement,
  Omit<TextProps, "elementType">
>(function H4({ children, ...rest }, ref) {
  return (
    <Text elementType="h4" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
