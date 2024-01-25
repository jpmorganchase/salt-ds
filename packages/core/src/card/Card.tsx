import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { makePrefixer } from "../utils";

import cardCss from "./Card.css";

const withBaseName = makePrefixer("saltCard");
export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   *
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, interactive styles will be applied to `Card`. These styles give prominence to certain content
   * on the page.
   */
  interactable?: boolean;
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
    className,
    disabled,
    interactable,
    children,
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
