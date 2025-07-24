import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ElementType,
  type ForwardedRef,
  type FunctionComponent,
  forwardRef,
} from "react";
import type { ValidationStatus } from "../status-indicator";
import {
  makePrefixer,
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
} from "../utils";
import textCss from "./Text.css";

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
      | "display4"
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
  props: TextProps<T>,
) => ReturnType<FunctionComponent>;

const withBaseName = makePrefixer("saltText");

export const Text: TextComponent = forwardRef(function Text<
  T extends ElementType = "div",
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
  ref?: ForwardedRef<unknown>,
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
        className,
      )}
      {...restProps}
      ref={ref as PolymorphicRef<T>}
      style={textStyles}
    >
      {children}
    </Component>
  );
});
