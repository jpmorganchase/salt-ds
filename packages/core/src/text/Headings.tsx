import { forwardRef } from "react";

import { Text, TextProps } from "./Text";

export const H1 = forwardRef<HTMLHeadingElement, Omit<TextProps<"h1">, "as">>(
  function H1({ children, ...rest }, ref) {
    return (
      <Text as="h1" ref={ref} {...rest}>
        {children}
      </Text>
    );
  }
);

export const H2 = forwardRef<HTMLHeadingElement, Omit<TextProps<"h2">, "as">>(
  function H2({ children, ...rest }, ref) {
    return (
      <Text as="h2" ref={ref} {...rest}>
        {children}
      </Text>
    );
  }
);

export const H3 = forwardRef<HTMLHeadingElement, Omit<TextProps<"h3">, "as">>(
  function H3({ children, ...rest }, ref) {
    return (
      <Text as="h3" ref={ref} {...rest}>
        {children}
      </Text>
    );
  }
);

export const H4 = forwardRef<HTMLHeadingElement, Omit<TextProps<"h4">, "as">>(
  function H4({ children, ...rest }, ref) {
    return (
      <Text as="h4" ref={ref} {...rest}>
        {children}
      </Text>
    );
  }
);
