import { forwardRef } from "react";

import { Text, TextProps } from "./Text";

export const Div = forwardRef<
  HTMLElement,
  Omit<TextProps<"div">, "elementType">
>(function Div({ children, ...rest }, ref) {
  return (
    <Text ref={ref} {...rest}>
      {children}
    </Text>
  );
});
