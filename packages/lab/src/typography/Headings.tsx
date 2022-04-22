import { ReactNode, ElementType, forwardRef } from "react";
import cx from "classnames";

import { makePrefixer } from "@brandname/core";
import { Text, TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export interface HeadingProps extends Omit<TextProps, "elementType"> {
  children: string | ReactNode;
  /**
   * Represents the semantic element.
   */
  // elementType?: ElementType & ("h1" | "h2" | "h3" | "h4");
  /**
   * Match styling to a specified heading
   */
  styleAs?: "h1" | "h2" | "h3" | "h4";
}

export const H1 = forwardRef<HTMLHeadingElement, HeadingProps>(function H1(
  { children, styleAs, ...rest },
  ref
) {
  return (
    <Text
      elementType="h1"
      className={cx({
        [withBaseName(`${styleAs}`)]: styleAs,
      })}
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});

export const H2 = forwardRef<HTMLHeadingElement, HeadingProps>(function H2(
  { children, styleAs, ...rest },
  ref
) {
  return (
    <Text
      elementType="h2"
      className={cx({
        [withBaseName(`${styleAs}`)]: styleAs,
      })}
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});

export const H3 = forwardRef<HTMLHeadingElement, HeadingProps>(function H3(
  { children, styleAs, ...rest },
  ref
) {
  return (
    <Text
      elementType="h3"
      className={cx({
        [withBaseName(`${styleAs}`)]: styleAs,
      })}
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});

export const H4 = forwardRef<HTMLHeadingElement, HeadingProps>(function H4(
  { children, styleAs, ...rest },
  ref
) {
  return (
    <Text
      elementType="h4"
      className={cx({
        [withBaseName(`${styleAs}`)]: styleAs,
      })}
      ref={ref}
      {...rest}
    >
      {children}
    </Text>
  );
});
