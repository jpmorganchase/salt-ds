import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const TextCode = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function TextAction({ children, className, ...rest }, ref) {
  return (
    <Text as="code" styleAs="code" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
