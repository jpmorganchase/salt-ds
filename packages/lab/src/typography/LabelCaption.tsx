import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const LabelCaption = forwardRef<
  HTMLLabelElement,
  Omit<TextProps<"label">, "elementType">
>(function LabelCaption({ children, ...rest }, ref) {
  return (
    <Text elementType="label" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
