import { ComponentPropsWithoutRef, forwardRef, ReactElement } from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "../utils";

import buttonCss from "./Button.css";
import { useButton } from "./useButton";

const withBaseName = makePrefixer("saltButton");

export const ButtonVariantValues = ["primary", "secondary", "cta"] as const;
export type ButtonVariant = (typeof ButtonVariantValues)[number];

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * If `true`, the button will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the button will be focusable when disabled.
   */
  focusableWhenDisabled?: boolean;
  /**
   * The variant to use. Options are 'primary', 'secondary' and 'cta'.
   * 'primary' is the default value.
   */
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled,
      focusableWhenDisabled,
      onKeyUp,
      onKeyDown,
      onBlur,
      onClick,
      type = "button",
      variant = "primary",
      ...restProps
    },
    ref?
  ): ReactElement<ButtonProps> {
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
      testId: "salt-button",
      css: buttonCss,
      window: targetWindow,
    });

    // we do not want to spread tab index in this case because the button element
    // does not require tabindex="0" attribute
    const { tabIndex, ...restButtonProps } = buttonProps;
    return (
      <button
        {...restButtonProps}
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("active")]: active,
          },
          className
        )}
        {...restProps}
        ref={ref}
        type={type}
      >
        {children}
      </button>
    );
  }
);
