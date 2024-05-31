import {
  makePrefixer,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from "../utils";
import { clsx } from "clsx";
import { ElementType, forwardRef, ReactElement } from "react";

import textCss from "./Text.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { ValidationStatus } from "../status-indicator";

export type TextProps<T extends ElementType> = PolymorphicComponentPropWithRef<
  T,
  {
    /**
     * Applies disabled styling when true
     */
    disabled?: boolean;
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
      | "display3"
      | "notation"
      | "action"
      | "code";
    /**
     * Change text color palette
     * @deprecated Use `color` instead
     */
    variant?: "primary" | "secondary";
    /*
     * The color of the text. Defaults to "primary".
     */
    color?: "inherit" | "primary" | "secondary" | ValidationStatus;
  }
>;

type TextComponent = <T extends ElementType = "div">(
  props: TextProps<T>
) => ReactElement | null;

const withBaseName = makePrefixer("saltText");

export const Text: TextComponent = forwardRef(function Text<
  T extends ElementType = "div"
>(
  {
    as,
    children,
    className,
    disabled = false,
    maxRows,
    style,
    styleAs,
    variant,
    color: colorProp,
    ...restProps
  }: TextProps<T>,
  ref?: PolymorphicRef<T>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-text",
    css: textCss,
    window: targetWindow,
  });

  const Component = as ?? "div";

  const textStyles = { "--text-max-rows": maxRows, ...style };

  const color = variant ?? colorProp ?? "primary";

  return (
    <Component
      className={clsx(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("lineClamp")]: maxRows,
          [withBaseName(styleAs as string)]: styleAs,
          [withBaseName(color)]: color !== "inherit",
        },
        className
      )}
      {...restProps}
      ref={ref}
      style={textStyles}
    >
      {children}
    </Component>
  );
});
