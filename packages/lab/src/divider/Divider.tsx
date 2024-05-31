import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import dividerCss from "./Divider.css";

export interface DividerProps extends ComponentPropsWithoutRef<"div"> {
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

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  function Divider(props, ref) {
    const {
      className,
      orientation = "horizontal",
      variant = "primary",
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-divider",
      css: dividerCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(orientation),
          withBaseName(variant),
          className
        )}
        aria-orientation={orientation}
        role="separator"
        ref={ref}
        {...rest}
      />
    );
  }
);
