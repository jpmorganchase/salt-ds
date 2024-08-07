import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  forwardRef,
} from "react";
import { makePrefixer } from "../utils";

import buttonCss from "./Button.css";
import { useButton } from "./useButton";

const withBaseName = makePrefixer("saltButton");

export const ButtonVariantValues = ["primary", "secondary", "cta"] as const;
export const ButtonAppearanceValues = [
  "filled",
  "outlined",
  "minimal",
] as const;
export const ButtonChromeValues = ["accent", "neutral"] as const;
export type ButtonVariant = (typeof ButtonVariantValues)[number];
export type ButtonAppearance = (typeof ButtonAppearanceValues)[number];
export type ButtonChrome = (typeof ButtonChromeValues)[number];

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
   * @deprecated Use `appearance` and `chrome` instead.
   */
  variant?: ButtonVariant;
  /**
   * The type of the button. Options are 'filled', 'outlined', and 'minimal'.
   */
  appearance?: ButtonAppearance;
  /**
   * Attention option of the button. Options are 'accent' and 'neutral'.
   */
  chrome?: ButtonChrome;
}

function mapVariantToNewProp(
  variant: ButtonVariant,
): Pick<ButtonProps, "appearance" | "chrome"> {
  switch (variant) {
    case "primary":
      return { appearance: "filled", chrome: "neutral" };
    case "secondary":
      return { appearance: "outlined", chrome: "neutral" };
    case "cta":
      return { appearance: "minimal", chrome: "accent" };
  }
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
      appearance: appearanceProp,
      chrome: chromeProp,
      type = "button",
      variant = "primary",
      ...restProps
    },
    ref?,
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

    const mapped = mapVariantToNewProp(variant);
    const appearance = appearanceProp ?? mapped.appearance;
    const chrome = chromeProp ?? mapped.chrome;

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
            [withBaseName(appearance || "")]: appearance,
            [withBaseName(chrome || "")]: chrome,
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
