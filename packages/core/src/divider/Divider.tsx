import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import dividerCss from "./Divider.css";

export interface DividerProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The orientation of the divider. Defaults to `"horizontal"`.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * The variant of the divider. Defaults to `"primary"`.
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
          className,
        )}
        aria-orientation={orientation}
        // biome-ignore lint/a11y/useAriaPropsForRole: Separator is not focusable, so it doesn't need aria-valuenow.
        role="separator"
        ref={ref}
        {...rest}
      />
    );
  },
);
