import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { capitalize, makePrefixer } from "../utils";
import { useInteractableCard } from "./useInteractableCard";

import interactableCardCss from "./InteractableCard.css";

const withBaseName = makePrefixer("saltInteractableCard");

// TODO: Remove omissions when Card props deprecated
export interface InteractableCardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Accent border position: defaults to "bottom"
   */
  accentPlacement?: "bottom" | "top" | "left" | "right";
  /**
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary";
}

export const InteractableCard = forwardRef<
  HTMLDivElement,
  InteractableCardProps
>(function InteractableCard(props, ref) {
  const {
    accentPlacement,
    children,
    className,
    variant = "primary",
    disabled,
    onBlur,
    onClick,
    onKeyUp,
    onKeyDown,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-interactable-card",
    css: interactableCardCss,
    window: targetWindow,
  });

  const { active, cardProps } = useInteractableCard({
    disabled,
    onKeyUp,
    onKeyDown,
    onBlur,
    onClick,
  });
  // for now, we do not want to spread tab index here as users may be wrapping in a link
  const { tabIndex, ...restCardProps } = cardProps;

  return (
    <div
      {...restCardProps}
      className={clsx(
        withBaseName(),
        withBaseName(variant),
        accentPlacement && withBaseName(`accent${capitalize(accentPlacement)}`),
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("active")]: active,
        },
        className
      )}
      {...rest}
      ref={ref}
    >
      {children}
    </div>
  );
});
