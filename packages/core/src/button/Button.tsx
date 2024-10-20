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
  "solid",
  "bordered",
  "transparent",
] as const;
export const ButtonSentimentValues = [
  "accented",
  "neutral",
  "positive",
  "negative",
  "caution",
] as const;
export type ButtonVariant = (typeof ButtonVariantValues)[number];
export type ButtonAppearance = (typeof ButtonAppearanceValues)[number];
export type ButtonSentiment = (typeof ButtonSentimentValues)[number];

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
   *
   * @deprecated Use `appearance` and `sentiment` instead.
   *
   * | variant     | appearance    | sentiment   |
   * | ----------- | ------------- | ----------- |
   * | `cta`       | `solid`       | `accented`  |
   * | `primary`   | `solid`       | `neutral`   |
   * | `secondary` | `transparent` | `neutral`   |
   */
  variant?: ButtonVariant;
  /**
   * The appearance of the button. Options are 'solid', 'bordered', and 'transparent'.
   * 'solid' is the default value.
   *
   * @since 1.36.0.
   */
  appearance?: ButtonAppearance;
  /**
   * The sentiment of the button. Options are 'accented', 'neutral', 'positive', 'negative' and 'caution'.
   * 'neutral' is the default value.
   *
   * @since 1.36.0.
   */
  sentiment?: ButtonSentiment;
}

function variantToAppearanceAndColor(
  variant: ButtonVariant,
): Pick<ButtonProps, "appearance" | "sentiment"> {
  switch (variant) {
    case "primary":
      return { appearance: "solid", sentiment: "neutral" };
    case "secondary":
      return { appearance: "transparent", sentiment: "neutral" };
    case "cta":
      return { appearance: "solid", sentiment: "accented" };
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
      sentiment: sentimentProp,
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

    const mapped = variantToAppearanceAndColor(variant);
    const appearance: ButtonAppearance =
      appearanceProp ?? mapped.appearance ?? "solid";
    const sentiment: ButtonSentiment =
      sentimentProp ?? mapped.sentiment ?? "neutral";

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
            [withBaseName(appearance)]: appearance,
            [withBaseName(sentiment)]: sentiment,
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
