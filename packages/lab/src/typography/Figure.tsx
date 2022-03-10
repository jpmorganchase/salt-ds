import { forwardRef } from "react";

import { makePrefixer } from "@brandname/core";

import { Text, TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export const Figure1 = forwardRef<HTMLDivElement, TextProps>(function Figure1(
  { children, ...rest },
  ref
) {
  return (
    <Text className={withBaseName(`figure1`)} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Figure2 = forwardRef<HTMLDivElement, TextProps>(function Figure2(
  { children, ...rest },
  ref
) {
  return (
    <Text className={withBaseName(`figure2`)} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Figure3 = forwardRef<HTMLDivElement, TextProps>(function Figure3(
  { children, ...rest },
  ref
) {
  return (
    <Text className={withBaseName(`figure3`)} ref={ref} {...rest}>
      {children}
    </Text>
  );
});
