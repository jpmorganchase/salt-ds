import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const Code = forwardRef<HTMLSpanElement, Omit<TextProps<"span">, "as">>(
  function TextAction({ children, className, ...rest }, ref) {
    return (
      <Text as="code" ref={ref} {...rest}>
        {children}
      </Text>
    );
  }
);
