import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { capitalize, makePrefixer } from "../utils";

import cardCss from "./Card.css";
import { hasCardSection } from "./hasCardSection";

const withBaseName = makePrefixer("saltCard");
export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If provided an accent is shown in the specified position.
   */
  accent?: "bottom" | "top" | "left" | "right";
  /**
   * Visual elevation.
   */
  elevation?: "flat" | "raised";
  /**
   * Border color strength.
   */
  borderColor?: "strong" | "subtle" | "none";
  /**
   * If `true`, the card will be disabled.
   * @deprecated since 1.5.0. Use `InteractableCard` instead.
   */
  disabled?: boolean;
  /**
   * If `true`, the card has hover styling.
   * @deprecated since 1.71.0. Remove this prop from `Card`. Use `LinkCard` or `InteractableCard` when the entire card is interactive.
   */
  hoverable?: boolean;
  /**
   * If `true`, interactive styles will be applied to `Card`. These styles give prominence to certain content
   * on the page.
   * @deprecated since 1.5.0. Use `InteractableCard` instead.
   */
  interactable?: boolean;
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(props, ref) {
    const {
      accent,
      borderColor,
      children,
      className,
      disabled,
      elevation = "raised",
      interactable,
      hoverable,
      variant = "primary",
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-card",
      css: cardCss,
      window: targetWindow,
    });

    const sectioned = hasCardSection(children);

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          borderColor && withBaseName(`borderColor${capitalize(borderColor)}`),
          {
            [withBaseName("accent")]: accent,
            [withBaseName(`accent${capitalize(accent || "")}`)]: accent,
            [withBaseName(elevation || "")]: elevation,
            [withBaseName("hoverable")]: hoverable,
            /* **Deprecated:** InteractableCard should be used instead for these features */
            [withBaseName("disabled")]: disabled,
            [withBaseName("interactable")]: interactable,
            [withBaseName("sectioned")]: sectioned,
          },
          className,
        )}
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
