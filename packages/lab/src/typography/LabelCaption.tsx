import { forwardRef, ForwardedRef, ReactElement } from "react";
import { polymorphicRef } from "@jpmorganchase/uitk-core";

import { Text, TextProps } from "./Text";

export const LabelCaption = forwardRef<
  HTMLElement,
  Omit<TextProps<"label">, "elementType">
>(function LabelCaption(
  { children, ...rest }: Omit<TextProps<"label">, "elementType">,
  ref?: ForwardedRef<HTMLElement>
): ReactElement<TextProps<"label">> {
  return (
    // @ts-ignore
    <Text elementType="label" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
