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
import { capitalize, makePrefixer, useControlled } from "@salt-ds/core";
import { useInteractableCard } from "./useInteractableCard";
import interactableCardCss from "./InteractableCard.css";
import {
  Value,
  useInteractableCardGroup,
} from "./internal/InteractableCardGroupContext";

const withBaseName = makePrefixer("saltInteractableCard");

export interface InteractableCardProps
  extends ComponentPropsWithoutRef<"button"> {
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
   * Callback fired when the selection changes.
   * @param event
   */
  onChange?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
   * Value of card (for selectable use case).
   */
  value?: Value;
}

export const InteractableCard = forwardRef<
  HTMLButtonElement,
  InteractableCardProps
>(function InteractableCard(props, ref) {
  const {
    accent,
    children,
    className,
    disabled: disabledProp,
    selected: selectedProp,
    variant = "primary",
    value,
    onBlur,
    onChange,
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

  const interactableCardGroup = useInteractableCardGroup();

  const interactableCardGroupSelected = interactableCardGroup
    ? interactableCardGroup.isSelected(value)
    : selectedProp;

  const disabled = interactableCardGroup?.disabled || disabledProp;

  const { active, cardProps } = useInteractableCard({
    disabled,
    onKeyUp,
    onKeyDown,
    onBlur,
    onClick,
  });

  const [selected, setSelected] = useControlled({
    controlled: interactableCardGroupSelected,
    default: Boolean(selectedProp),
    name: "InteractableCard",
    state: "selected",
  });

  const role = interactableCardGroup
    ? interactableCardGroup.selectionVariant === "multiselect"
      ? "checkbox"
      : "radio"
    : "button";

  const ariaChecked =
    role === "radio" || role === "checkbox" ? selected : undefined;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (interactableCardGroup) {
      interactableCardGroup.select(event);
      setSelected(!selected);
    }
    onChange?.(event);
    onClick?.(event);
  };

  return (
    <button
      {...cardProps}
      role={role}
      aria-checked={ariaChecked}
      data-id={value}
      disabled={disabled}
      className={clsx(
        withBaseName(),
        withBaseName(variant),
        {
          [withBaseName("accent")]: accent,
          [withBaseName(`accent${capitalize(accent || "")}`)]: accent,
          [withBaseName("active")]: active,
          [withBaseName("disabled")]: disabled,
          [withBaseName("selected")]: selected,
        },
        className
      )}
      {...rest}
      onClick={interactableCardGroup ? handleClick : onClick}
      ref={ref}
      value={value}
    >
      {children}
    </button>
  );
});
