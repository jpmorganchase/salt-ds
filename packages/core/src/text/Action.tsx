import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const Action = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Action({ children, className, ...rest }, ref) {
  return (
    <Text as="span" styleAs="action" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
