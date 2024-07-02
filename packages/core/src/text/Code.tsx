import { forwardRef } from "react";
import { Text, type TextProps } from "./Text";

export const Code = forwardRef<HTMLSpanElement, Omit<TextProps<"code">, "as">>(
  function TextAction({ children, ...rest }, ref) {
    return (
      <Text as="code" ref={ref} {...rest}>
        {children}
      </Text>
    );
  },
);
