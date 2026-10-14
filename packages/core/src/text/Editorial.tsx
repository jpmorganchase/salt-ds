import { forwardRef } from "react";
import { Text, type TextProps } from "./Text";

export const Editorial1 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Editorial1({ children, styleAs = "editorial1", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Editorial2 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Editorial2({ children, styleAs = "editorial2", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Editorial3 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Editorial3({ children, styleAs = "editorial3", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Editorial4 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Editorial4({ children, styleAs = "editorial4", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Editorial5 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Editorial5({ children, styleAs = "editorial5", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Editorial6 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Editorial6({ children, styleAs = "editorial6", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Editorial7 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Editorial7({ children, styleAs = "editorial7", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const Editorial8 = forwardRef<
  HTMLSpanElement,
  Omit<TextProps<"span">, "as">
>(function Editorial8({ children, styleAs = "editorial8", ...rest }, ref) {
  return (
    <Text as="span" styleAs={styleAs} ref={ref} {...rest}>
      {children}
    </Text>
  );
});
