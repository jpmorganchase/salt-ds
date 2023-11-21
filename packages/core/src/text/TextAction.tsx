import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const TextAction = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function TextAction({ children, className, ...rest }, ref) {
  return (
    <Text as="span" styleAs="action" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
