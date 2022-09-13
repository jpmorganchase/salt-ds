import { forwardRef } from "react";
import cx from "classnames";

import { makePrefixer } from "@jpmorganchase/uitk-core";

import { Text, TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export const HelpText = forwardRef<
  HTMLDivElement,
  Omit<TextProps<"div">, "elementType">
>(function HelpText({ children, className, ...rest }, ref) {
  return (
    <Text
      className={cx(className, withBaseName(`helpText`))}
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});
