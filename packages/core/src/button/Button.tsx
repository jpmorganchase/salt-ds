import {
  useClassNameInjection,
  useComponentCssInjection,
} from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
} from "react";
import { Spinner } from "../spinner";
import { makePrefixer } from "../utils";

import buttonCss from "./Button.css";
import { useButton } from "./useButton";

const withBaseName = makePrefixer("saltButton");

export interface ButtonVariants {
  primary: string;
  secondary: string;
  cta: string;
}
export type ButtonVariant = keyof ButtonVariants;
export const ButtonVariantValues = [
  "primary",
  "secondary",
  "cta",
] as const satisfies ReadonlyArray<ButtonVariant>;

export interface ButtonAppearances {
  solid: string;
  bordered: string;
  transparent: string;
}
export type ButtonAppearance = keyof ButtonAppearances;
export const ButtonAppearanceValues = [
  "solid",
  "bordered",
  "transparent",
] as const satisfies ReadonlyArray<ButtonAppearance>;

export interface ButtonSentiments {
  accented: string;
  neutral: string;
  positive: string;
  negative: string;
  caution: string;
}
export type ButtonSentiment = keyof ButtonSentiments;
export const ButtonSentimentValues = [
  "accented",
  "neutral",
  "positive",
  "negative",
  "caution",
] as const satisfies ReadonlyArray<ButtonSentiment>;

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

  /**
   * If `true`, the button will be in a loading state. This allows a spinner to be nested inside the button.
   *
   * @since 1.38.0.
   */
  loading?: boolean;

  /**
   * Text to be announced by screen readers, intended to be used in conjunction with the `loading` prop.
   *
   * @since 1.38.0.
   */
  loadingAnnouncement?: string;
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
  function Button(props, ref) {
    const { className, props: finalProps } = useClassNameInjection(
      "saltButton",
      props,
    );

    const {
      children,
      disabled,
      focusableWhenDisabled,
      onKeyUp,
      onKeyDown,
      onBlur,
      onClick,
      loading,
      loadingAnnouncement,
      appearance: appearanceProp,
      sentiment: sentimentProp,
      type: typeProp = "button",
      variant = "primary",
      ...restProps
    } = finalProps;

    const { active, buttonProps } = useButton({
      loading,
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
      appearanceProp ?? mapped?.appearance ?? "solid";

    const sentiment: ButtonSentiment =
      sentimentProp ?? mapped?.sentiment ?? "neutral";

    // we do not want to spread tab index in this case because the button element
    // does not require tabindex="0" attribute
    const { tabIndex, ...restButtonProps } = buttonProps;

    /* When the button is in a loading state, we want to prevent form submission. */
    const type = typeProp === "submit" && loading ? "button" : typeProp;

    return (
      <button
        {...restButtonProps}
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("loading")]: loading,
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
        {loading && (
          <div className={withBaseName("spinner")} aria-hidden>
            <Spinner size="small" aria-hidden disableAnnouncer />
          </div>
        )}
        {typeof loadingAnnouncement === "string" && (
          <span role="status" className={withBaseName("sr-only")}>
            {loadingAnnouncement}
          </span>
        )}
        {children}
      </button>
    );
  },
);
