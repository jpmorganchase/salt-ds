import { clsx } from "clsx";
import { forwardRef } from "react";
import { Card, CardProps } from "./Card";
import { capitalize, makePrefixer } from "../utils";
import { useInteractableCard } from "./useInteractableCard";

import "./InteractableCard.css";

const withBaseName = makePrefixer("saltInteractableCard");

// TODO: Remove omissions when Card props deprecated
export interface InteractableCardProps
  extends Omit<CardProps, "disabled" | "interactable"> {
  /**
   * Accent border position: defaults to "bottom"
   */
  accentPlacement?: "bottom" | "top" | "left" | "right";
  /**
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
}

export const InteractableCard = forwardRef<
  HTMLDivElement,
  InteractableCardProps
>(function InteractableCard(props, ref) {
  const {
    accentPlacement = "bottom",
    children,
    className,
    disabled,
    onBlur,
    onClick,
    onKeyUp,
    onKeyDown,
    ...rest
  } = props;

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
    <Card
      {...restCardProps}
      className={clsx(
        withBaseName(),
        withBaseName(`accent${capitalize(accentPlacement)}`),
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
    </Card>
  );
});
