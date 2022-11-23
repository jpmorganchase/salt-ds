import { makePrefixer, polymorphicRef } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  forwardRef,
  ReactElement,
} from "react";

import "./Text.css";

const withBaseName = makePrefixer("uitkText");

interface TextPropsBase<E extends ElementType> {
  /**
   * Represents the semantic element tag name as a string.
   * Defaults to 'div'
   */
  elementType?: ElementType;
  maxRows?: number;
  /**
   * Customise styling.
   */
  style?: CSSProperties;
  /**
   * Match styling to a specified heading
   */
  styleAs?: "h1" | "h2" | "h3" | "h4" | "label";
  variant?: "primary" | "secondary";
  help?: boolean;
}

export type TextProps<E extends ElementType = "div"> = TextPropsBase<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof TextPropsBase<E>>;

type PolymorphicText = <T extends ElementType>(
  p: TextProps<T> & { ref?: polymorphicRef<T> }
) => ReactElement<TextProps<T>>;

export const Text = forwardRef(function Text<T extends ElementType>(
  props: TextProps<T>,
  ref?: polymorphicRef<T>
): ReactElement<TextProps<T>> {
  const {
    children,
    className,
    elementType = "div",
    maxRows,
    style,
    styleAs,
    variant = "primary",
    ...restProps
  } = props;

  const Component: ElementType = elementType;

  return (
    <Component
      className={cx(withBaseName(), className, {
        [withBaseName("lineClamp")]: maxRows,
        [withBaseName(styleAs || "")]: styleAs,
        [withBaseName(variant)]: variant,
      })}
      {...restProps}
      ref={ref}
      style={{ ...style, "--text-max-rows": maxRows }}
    >
      {children}
    </Component>
  );
}) as PolymorphicText;
