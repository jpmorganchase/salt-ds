import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { capitalize, makePrefixer } from "../utils";

import cardCss from "./Card.css";

const withBaseName = makePrefixer("saltCard");
export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Accent border position: defaults to "bottom"
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
   * Card size; adjusts the padding.
   */
  size?: "small" | "medium" | "large";
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  props,
  ref
) {
  const {
    accentPlacement,
    className,
    disabled,
    interactable,
    children,
    size = "large",
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
        withBaseName(size),
        withBaseName(variant),
        {
          [withBaseName(`accent${capitalize(accentPlacement || "")}`)]:
            accentPlacement,
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
