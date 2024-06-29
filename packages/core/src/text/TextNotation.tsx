import { forwardRef } from "react";
import { Text, type TextProps } from "./Text";

export const TextNotation = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function TextNotation({ children, ...rest }, ref) {
  return (
    <Text as="span" styleAs="notation" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
