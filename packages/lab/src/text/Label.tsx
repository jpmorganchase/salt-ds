import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const Label = forwardRef<
  HTMLLabelElement,
  Omit<TextProps<"label">, "elementType">
>(function Label({ children, ...rest }, ref) {
  return (
    <Text elementType="label" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
