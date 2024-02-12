import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { makePrefixer } from "../utils";

import cardCss from "./Card.css";

const withBaseName = makePrefixer("saltCard");
export interface CardProps extends ComponentPropsWithoutRef<"div"> {
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
   * Card size; adjusts the padding. Defaults to `large`.
   */
  size?: "small" | "medium" | "large";
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
    className,
    disabled,
    interactable,
    hoverEffect = false,
    size = "large",
    variant = "primary",
    children,
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
        withBaseName(size),
        withBaseName(variant),
        {
          /* **Deprecated:** InteractableCard should be used instead for these features */
          [withBaseName("disabled")]: disabled,
          [withBaseName("hover")]: hoverEffect,
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
