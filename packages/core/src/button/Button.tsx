import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  forwardRef,
} from "react";
import { makePrefixer } from "../utils";
import { Spinner } from "../spinner";

import buttonCss from "./Button.css";
import { useButton } from "./useButton";

const withBaseName = makePrefixer("saltButton");

export const ButtonVariantValues = ["primary", "secondary", "cta"] as const;
export const AppearanceValues = ["solid", "outline", "transparent"] as const;
export const ButtonColorValues = ["accent", "neutral"] as const;
export type ButtonVariant = (typeof ButtonVariantValues)[number];
export type Appearance = (typeof AppearanceValues)[number];
export type ButtonColor = (typeof ButtonColorValues)[number];

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
   * @deprecated Use `appearance` and `color` instead.
   */
  variant?: ButtonVariant;
  /**
   * To show a loading spinner.
   */
  loading?: boolean;
  /**
   * For the screen reader to announce while button is in loading state
   * 'Loading' is the default value.
   */
  loadingText?: string;
  /**
   * If `true`, a loading text with spinner will be shown while button is in loading state.
   */
  showLoadingText?: boolean;
  /**
   * The type of the button. Options are 'solid', 'outline', and 'transparent'.
   */
  appearance?: Appearance;
  /**
   * The color of the button. Options are 'accent' and 'neutral'.
   */
  color?: ButtonColor;
}

function variantToAppearanceAndColor(variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return { appearance: "solid", color: "neutral" };
    case "secondary":
      return { appearance: "transparent", color: "neutral" };
    case "cta":
      return { appearance: "solid", color: "accent" };
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
      color: colorProp,
      type = "button",
      variant = "primary",
      loading,
      loadingText = "Loading",
      showLoadingText,
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

    const mapped = variantToAppearanceAndColor(variant);
    const appearance = appearanceProp ?? mapped.appearance;
    const color = colorProp ?? mapped.color;

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
            [withBaseName(`loading-${variant}`)]: loading,
            [withBaseName("active")]: active,
            [withBaseName(appearance)]: appearance,
            [withBaseName(color)]: color,
          },
          className,
        )}
        {...restProps}
        ref={ref}
        type={type}
      >
        {loading ? (
          <>
            <span className={clsx(withBaseName("loading-overlay"), className)}>
              <Spinner
                size="small"
                className={clsx(withBaseName("loading-spinner"), className)}
                aria-label={!showLoadingText ? loadingText : ""}
              />
              {showLoadingText && (
                <span className={clsx(withBaseName("loading-text"), className)}>
                  {loadingText}
                </span>
              )}
            </span>
            <span
              aria-hidden="true"
              className={clsx(withBaseName("hidden-element"))}
            >
              {children}
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
