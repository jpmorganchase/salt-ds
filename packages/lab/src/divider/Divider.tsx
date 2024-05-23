import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import DividerCss from "./Divider.css";

export interface DividerProps extends ComponentPropsWithoutRef<"hr"> {
  /**
   * The divider orientation.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * The variant to use. Options are 'primary', 'secondary' and 'tertiary'.
   * 'primary' is the default value.
   */
  variant?: "primary" | "secondary" | "tertiary";
}

const withBaseName = makePrefixer("saltDivider");

export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  props,
  ref
) {
  const {
    className,
    orientation = "horizontal",
    variant = "primary",
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-divider",
    css: DividerCss,
    window: targetWindow,
  });

  return (
    <hr
      className={clsx(
        withBaseName(),
        [withBaseName(orientation)],
        [withBaseName(variant)],
        className
      )}
      ref={ref}
      {...rest}
    />
  );
});
