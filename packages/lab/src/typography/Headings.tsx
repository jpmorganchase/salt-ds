import { ReactNode, forwardRef } from "react";

import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Text, TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export interface HeadingProps extends Omit<TextProps, "elementType"> {
  children: string | ReactNode;
  /**
   * Match styling to a specified heading
   */
  styleAs?: "h1" | "h2" | "h3" | "h4";
}

export const H1 = forwardRef<HTMLHeadingElement, HeadingProps>(function H1(
  { children, styleAs, ...rest },
  ref
) {
  const cssClass = styleAs ? withBaseName(styleAs) : "";
  return (
    <Text elementType="h1" className={cssClass} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const H2 = forwardRef<HTMLHeadingElement, HeadingProps>(function H2(
  { children, styleAs, ...rest },
  ref
) {
  const cssClass = styleAs ? withBaseName(styleAs) : "";
  return (
    <Text elementType="h2" className={cssClass} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const H3 = forwardRef<HTMLHeadingElement, HeadingProps>(function H3(
  { children, styleAs, ...rest },
  ref
) {
  const cssClass = styleAs ? withBaseName(styleAs) : "";
  return (
    <Text elementType="h3" className={cssClass} ref={ref} {...rest}>
      {children}
    </Text>
  );
});

export const H4 = forwardRef<HTMLHeadingElement, HeadingProps>(function H4(
  { children, styleAs, ...rest },
  ref
) {
  const cssClass = styleAs ? withBaseName(styleAs) : "";
  return (
    <Text elementType="h4" className={cssClass} ref={ref} {...rest}>
      {children}
    </Text>
  );
});
