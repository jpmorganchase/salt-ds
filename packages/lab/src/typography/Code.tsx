import { forwardRef, ForwardedRef, ReactElement } from "react";

import { Text, TextProps } from "./Text";

export const Code = forwardRef<
  HTMLElement,
  Omit<TextProps<"code">, "elementType">
>(function Code(
  { children, ...rest }: Omit<TextProps<"code">, "elementType">,
  ref?: ForwardedRef<HTMLElement>
): ReactElement<TextProps<"code">> {
  return (
    <Text elementType="code" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
