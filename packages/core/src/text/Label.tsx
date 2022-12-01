import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const Label = forwardRef<
  HTMLLabelElement,
  Omit<TextProps<"label">, "as">
>(function Label({ children, ...rest }, ref) {
  return (
    <Text as="label" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
