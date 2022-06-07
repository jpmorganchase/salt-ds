import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const Span = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "elementType">
>(function Span({ children, ...rest }, ref) {
  return (
    <Text elementType="span" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
