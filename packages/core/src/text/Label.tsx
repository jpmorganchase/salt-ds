import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export type LabelProps = Omit<TextProps<"label">, "as">;

export const Label = forwardRef<
  HTMLLabelElement,
  LabelProps
>(function Label({ children, ...rest }, ref) {
  return (
    <Text as="label" ref={ref} {...rest}>
      {children}
    </Text>
  );
});
