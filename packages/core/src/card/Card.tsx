import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { capitalize, makePrefixer } from "../utils";

import cardCss from "./Card.css";

const withBaseName = makePrefixer("saltCard");
export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Accent position.
   */
  accentPlacement?: "bottom" | "top" | "left" | "right";
  /**
   * **Deprecated:** Use the InteractableCard component instead
   *
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
  /**
   * **Deprecated:** Use the InteractableCard component instead
   *
   * If `true`, interactive styles will be applied to `Card`. These styles give prominence to certain content
   * on the page.
   */
  interactable?: boolean;
  /**
   * Whether to show hover effect. Defaults to `false`.
   */
  hoverEffect?: boolean;
  /**
   * Card padding size; adjusts the padding. Defaults to `large`.
   */
  paddingSize?: "small" | "medium" | "large";
  /**
   * Styling variant. Defaults to `primary`.
   */
  variant?: "primary" | "secondary";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  props,
  ref
) {
  const {
    accentPlacement,
    children,
    className,
    disabled,
    interactable,
    hoverEffect = false,
    paddingSize = "large",
    variant = "primary",
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-card",
    css: cardCss,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(
        withBaseName(),
        withBaseName(paddingSize),
        withBaseName(variant),
        {
          [withBaseName("accent")]: accentPlacement,
          [withBaseName(`accent${capitalize(accentPlacement || "")}`)]:
            accentPlacement,
          [withBaseName("hover")]: hoverEffect,
          /* **Deprecated:** InteractableCard should be used instead for these features */
          [withBaseName("disabled")]: disabled,
          [withBaseName("interactable")]: interactable,
        },
        className
      )}
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  );
});
