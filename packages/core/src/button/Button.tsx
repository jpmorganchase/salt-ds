import { ComponentPropsWithoutRef, forwardRef, ReactElement } from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "../utils";
import { Spinner } from "../spinner";

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
  /**
   * To show a loading spinner.
   */
  isLoading?: boolean;
  /**
   * For the screen reader to announce while button is in loading state
   * 'Loading' is the default value.
   */
  loadingText?: string;
  /**
   * If `true`, a loading text with spinner will be shown while button is in loading state.
   */
  showLoadingText?: boolean;
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
      isLoading,
      loadingText = "Loading",
      showLoadingText,
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
            [withBaseName(`loading-${variant}`)]: isLoading,
            [withBaseName("active")]: active,
          },
          className
        )}
        aria-disabled={disabled}
        aria-live={isLoading !== undefined ? "assertive" : undefined}
        {...restProps}
        ref={ref}
        type={type}
      >
        {isLoading ? (
          <>
            <span className={clsx(withBaseName("loading-overlay"), className)}>
              <Spinner
                size="small"
                className={clsx(withBaseName("loading-spinner"), className)}
              />
              <span
                className={clsx(
                  {
                    [withBaseName("hidden-accessible-element")]:
                      !showLoadingText,
                    [withBaseName("loading-text")]: showLoadingText,
                  },
                  className
                )}
              >
                {loadingText}
              </span>
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
  }
);
