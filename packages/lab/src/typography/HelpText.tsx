import { forwardRef } from "react";

import { makePrefixer } from "@jpmorganchase/uitk-core";

import { Text, TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export const HelpText = forwardRef<
  HTMLDivElement,
  Omit<TextProps, "elementType">
>(function HelpText({ children, ...rest }, ref) {
  return (
    <Text className={withBaseName(`helpText`)} ref={ref} {...rest}>
      {children}
    </Text>
  );
});
