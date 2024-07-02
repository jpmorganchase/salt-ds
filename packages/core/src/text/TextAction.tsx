import { forwardRef } from "react";
import { Text, type TextProps } from "./Text";

export const TextAction = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function TextAction({ children, ...rest }, ref) {
  return (
    <Text as="span" styleAs="action" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
