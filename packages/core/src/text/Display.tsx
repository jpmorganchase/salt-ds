import { forwardRef } from "react";
import { Text, type TextProps } from "./Text";

export const Display1 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display1({ children, styleAs = "display1", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Display2 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display2({ children, styleAs = "display2", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Display3 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display3({ children, styleAs = "display3", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Display4 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display4({ children, styleAs = "display4", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Display5 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display5({ children, styleAs = "display5", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Display6 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display6({ children, styleAs = "display6", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Display7 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display7({ children, styleAs = "display7", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Display8 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Display8({ children, styleAs = "display8", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});
