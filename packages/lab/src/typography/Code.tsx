import { forwardRef } from "react";

import { Text, TextProps } from "./Text";

export const Code = forwardRef<
  HTMLElement,
  Omit<TextProps<"code">, "elementType">
>(function Code({ children, ...rest }, ref) {
  return (
    <Text elementType="code" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
