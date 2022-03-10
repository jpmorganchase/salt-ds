import { forwardRef } from "react";

import { Text, TextProps } from "./Text";

export const Code = forwardRef<HTMLElement, TextProps>(function Code(
  { children, ...rest },
  ref
) {
  return (
    <Text elementType="code" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
