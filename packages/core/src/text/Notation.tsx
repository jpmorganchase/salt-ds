import { forwardRef } from "react";
import { makePrefixer } from "../utils";
import { clsx } from "clsx";
import { Text, TextProps } from "./Text";

const withBaseName = makePrefixer("saltText");

export const Notation = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Notation({ children, className, ...rest }, ref) {
  return (
    <Text
      as="span"
      className={clsx(className, withBaseName("notation"))}
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});
