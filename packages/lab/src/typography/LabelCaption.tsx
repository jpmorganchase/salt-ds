import { forwardRef } from "react";
import { Text, TextProps } from "./Text";

export const LabelCaption = forwardRef<HTMLLabelElement, TextProps>(
  function LabelCaption({ children, ...rest }, ref) {
    return (
      <Text elementType="label" ref={ref} {...rest}>
        {children}
      </Text>
    );
  }
);
