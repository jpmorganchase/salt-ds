import { forwardRef } from "react";
import { Text, type TextProps } from "./Text";

export const Eyebrow = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Eyebrow({ children, styleAs = "eyebrow", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});
