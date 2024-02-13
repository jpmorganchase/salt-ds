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
  accent?: "bottom" | "top" | "left" | "right";
  /**
   * **Deprecated:** Use the InteractableCard component instead
   *
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true` the card will have hover styling.
   */
  hoverable?: boolean;
  /**
   * **Deprecated:** Use the InteractableCard component instead
   *
   * If `true`, interactive styles will be applied to `Card`. These styles give prominence to certain content
   * on the page.
   */
  interactable?: boolean;
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
    accent,
    children,
    className,
    disabled,
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

  return (
    <div
      className={clsx(
        withBaseName(),
        withBaseName(variant),
        {
          [withBaseName("accent")]: accent,
          [withBaseName(`accent${capitalize(accent || "")}`)]: accent,
          [withBaseName("hover")]: hoverable,
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
