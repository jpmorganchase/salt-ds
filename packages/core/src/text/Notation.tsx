import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const Notation = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Notation({ children, className, ...rest }, ref) {
  return (
    <Text as="span" styleAs="notation" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
