import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { capitalize, makePrefixer } from "../utils";
import { useInteractableCard } from "./useInteractableCard";

import "./Card.css";

const withBaseName = makePrefixer("saltCard");

export interface InteractableCardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Accent border position: defaults to "bottom"
   *
   * Must be one of  "bottom" | "top" | "left"
   */
  accentPosition?: "bottom" | "top" | "left";
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
    accentPosition = "bottom",
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
  // for now, we do not want to spread tab index as users may be wrapping in a link
  const { tabIndex, ...restCardProps } = cardProps;

  return (
    <div
      {...restCardProps}
      className={clsx(
        withBaseName(),
        withBaseName("interactable"),
        withBaseName(`accent${capitalize(accentPosition)}`),
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("active")]: active,
        },
        className
      )}
      {...rest}
      ref={ref}
    >
      <div className={withBaseName("content")}>{children}</div>
    </div>
  );
});
