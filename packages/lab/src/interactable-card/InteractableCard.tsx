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
import { useInteractableCardGroup } from "./internal/InteractableCardGroupContext";

const withBaseName = makePrefixer("saltInteractableCard");

// TODO: Remove omissions when Card props deprecated
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
  onChange?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary";

  value?: string | number;
}

export const InteractableCard = forwardRef<
  HTMLButtonElement,
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

  const { active, cardProps } = useInteractableCard({
    disabled,
    onKeyUp,
    onKeyDown,
    onBlur,
    onClick,
  });

  const interactableCardGroup = useInteractableCardGroup();

  const interactableCardGroupSelected = interactableCardGroup
    ? interactableCardGroup.isSelected(value)
    : selectedProp;

  const [selected, setSelected] = useControlled({
    controlled: interactableCardGroupSelected,
    default: Boolean(selectedProp),
    name: "InteractableCard",
    state: "selected",
  });

  const role = interactableCardGroup ? "radio" : "button";

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    interactableCardGroup?.select(event);
    console.log("selected");
    setSelected(!selected);
    onChange?.(event);
    onClick?.(event);
  };

  return (
    <button
      {...cardProps}
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
      onClick={handleClick}
      value={value}
      ref={ref}
    >
      {children}
    </button>
  );
});
