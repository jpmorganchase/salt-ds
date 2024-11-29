import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  forwardRef,
} from "react";

import { makePrefixer, useButton } from "@salt-ds/core";
import ghostButtonCss from "./GhostButton.css";

const withBaseName = makePrefixer("saltGhostButton");

export interface GhostButtonProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * If `true`, the button will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the button will be focusable when disabled.
   */
  focusableWhenDisabled?: boolean;
  /**
   * The appearance of the button.
   */
  adaptiveAppearance?: "solid" | "non-solid";
}

export const GhostButton = forwardRef<HTMLButtonElement, GhostButtonProps>(
  function GhostButton(
    {
      children,
      className,
      disabled = false,
      adaptiveAppearance = "non-solid",
      focusableWhenDisabled,
      onKeyUp,
      onKeyDown,
      onBlur,
      onClick,
      type = "button",
      ...restProps
    },
    ref,
  ): ReactElement<GhostButtonProps> {
    const { active, buttonProps } = useButton({
      disabled,
      focusableWhenDisabled,
      onKeyUp,
      onKeyDown,
      onBlur,
      onClick,
    });

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-ghost-button",
      css: ghostButtonCss,
      window: targetWindow,
    });

    return (
      <button
        {...buttonProps}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("active")]: active,
            [withBaseName(adaptiveAppearance)]: adaptiveAppearance === "solid",
          },
          className,
        )}
        {...restProps}
        ref={ref}
        type={type}
      >
        {children}
      </button>
    );
  },
);
