import React, {
  forwardRef,
  useRef,
  MouseEvent,
  KeyboardEvent,
  ComponentPropsWithoutRef,
  useContext,
} from "react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { capitalize, makePrefixer } from "@salt-ds/core";
import { useInteractableCard } from "./useInteractableCard";
import interactableCardCss from "./InteractableCard.css";
import { useInteractableCardGroup } from "./internal/InteractableCardGroupContext";

const withBaseName = makePrefixer("saltInteractableCard");

// TODO: Remove omissions when Card props deprecated
export interface InteractableCardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Accent border position: defaults to "bottom"
   */
  accent?: "bottom" | "top" | "left" | "right";
  /**
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the card will have selected styling.
   */
  selected?: boolean;
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary";

  value?: string | number;
}

export const InteractableCard = forwardRef<
  HTMLDivElement,
  InteractableCardProps
>(function InteractableCard(props, ref) {
  const {
    accent = "bottom",
    children,
    className,
    disabled,
    selected: selectedProp,
    variant = "primary",
    value,
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

  const interactableCardGroup = useInteractableCardGroup();

  const selected = interactableCardGroup
    ? interactableCardGroup.isSelected(value)
    : selectedProp;
  const role = interactableCardGroup ? "radio" : "button";

  const handleInteraction = () => {
    if (!disabled && value !== undefined) {
      interactableCardGroup?.select(value);
    }
  };

  const conditionalProps = interactableCardGroup
    ? {
        tabIndex: !disabled ? 0 : -1,
        onClick: (event: MouseEvent<HTMLDivElement>) => {
          handleInteraction();
          event.stopPropagation();
        },
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            handleInteraction();
            event.preventDefault();
          }
        },
        "aria-checked": role === "radio" ? selected : undefined,
        "data-id": value,
        role: role,
      }
    : {};

  return (
    <div
      {...cardProps}
      {...conditionalProps}
      role={role}
      aria-checked={role === "radio" ? selected : undefined}
      data-id={value}
      className={clsx(
        withBaseName(),
        withBaseName(variant),
        withBaseName(`accent${capitalize(accent)}`),
        {
          [withBaseName("active")]: active,
          [withBaseName("disabled")]: disabled,
          [withBaseName("selected")]: selected,
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
