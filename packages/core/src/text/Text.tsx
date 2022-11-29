import { makePrefixer } from "../utils";
import cx from "classnames";
import {
  ElementType,
  forwardRef,
  ReactElement,
  PropsWithChildren,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
} from "react";

import "./Text.css";

const withBaseName = makePrefixer("uitkText");

type ElementTypeProp<T extends ElementType> = {
  /**
   * Represents the semantic element tag name as a string.
   * Defaults to 'div'
   */
  elementType?: ElementType;
};

type PropsToOmit<T extends ElementType, P> = keyof (ElementTypeProp<T> & P);

type PolymorphicComponentProp<T extends ElementType, Props> = PropsWithChildren<
  Props & ElementTypeProp<T>
> &
  Omit<ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>;

type PolymorphicRef<T extends ElementType> = ComponentPropsWithRef<T>["ref"];

export type PolymorphicComponentPropWithRef<
  T extends ElementType,
  Props
> = PolymorphicComponentProp<T, Props> & { ref?: PolymorphicRef<T> };

export type TextProps<T extends ElementType> = PolymorphicComponentPropWithRef<
  T,
  {
    /**
     * Apply text truncation by mentioning number of rows to be displayed
     */
    maxRows?: number;
    /**
     * Match styling to another text component's style
     */
    styleAs?:
      | "h1"
      | "h2"
      | "h3"
      | "h4"
      | "label"
      | "display1"
      | "display2"
      | "display3";
    /**
     * Change text color palette
     */
    variant?: "primary" | "secondary";
  }
>;

type TextComponent = <T extends ElementType>(
  props: TextProps<T>
) => ReactElement | null;

export const Text: TextComponent = forwardRef(
  <T extends ElementType>(
    {
      children,
      className,
      elementType,
      maxRows,
      styleAs,
      variant = "primary",
      ...restProps
    }: TextProps<T>,
    ref?: PolymorphicRef<T>
  ): ReactElement<TextProps<T>> => {
    const Component = elementType || "div";

    return (
      <Component
        className={cx(withBaseName(), className, {
          [withBaseName("lineClamp")]: maxRows,
          [withBaseName(styleAs || "")]: styleAs,
          [withBaseName(variant)]: variant,
        })}
        {...restProps}
        ref={ref}
        style={{ "--text-max-rows": maxRows }}
      >
        {children}
      </Component>
    );
  }
);
