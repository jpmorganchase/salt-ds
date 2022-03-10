import { forwardRef } from "react";

import { makePrefixer } from "@brandname/core";

import { Text, TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export const HelpText = forwardRef<HTMLDivElement, TextProps>(function HelpText(
  { children, ...rest },
  ref
) {
  return (
    <Text className={withBaseName(`helpText`)} ref={ref} {...rest}>
      {children}
    </Text>
  );
});
