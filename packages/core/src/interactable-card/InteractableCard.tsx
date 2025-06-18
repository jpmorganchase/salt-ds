import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
  type SyntheticEvent,
  useRef,
} from "react";
import { capitalize, makePrefixer, useControlled, useForkRef } from "../utils";
import interactableCardCss from "./InteractableCard.css";
import {
  type InteractableCardValue,
  useInteractableCardGroup,
} from "./InteractableCardGroupContext";
import { useInteractableCard } from "./useInteractableCard";

const withBaseName = makePrefixer("saltInteractableCard");

export interface InteractableCardProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Accent border position: defaults to "bottom"
   */
  accent?: "bottom" | "top" | "left" | "right";
  /**
   * @deprecated Use the `accent` prop instead
   */
  accentPlacement?: "bottom" | "top" | "left" | "right";
  /**
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
  /**
   * Callback fired when the selection changes.
   * @param event
   */
  onChange?: (event: SyntheticEvent<HTMLDivElement>) => void;
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Value of card (for selectable use case).
   */
  value?: InteractableCardValue;
}

export const InteractableCard = forwardRef<
  HTMLDivElement,
  InteractableCardProps
>(function InteractableCard(props, ref) {
  const {
    accent,
    accentPlacement,
    children,
    className,
    disabled: disabledProp,
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

  const interactableCardGroupSelected =
    interactableCardGroup?.isSelected(value);

  const disabled = interactableCardGroup?.disabled || disabledProp;

  const [selected, setSelected] = useControlled({
    controlled: interactableCardGroupSelected,
    default: Boolean(false),
    name: "InteractableCard",
    state: "selected",
  });

  const role = interactableCardGroup
    ? interactableCardGroup.multiSelect
      ? "checkbox"
      : "radio"
    : "button";

  const isMultiselect = interactableCardGroup?.multiSelect;

  const isFirstChild = interactableCardGroup?.isFirstChild(value);

  const ariaChecked =
    role === "radio" || role === "checkbox" ? selected : undefined;

  const accentValue = accent || accentPlacement;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (interactableCardGroup && !disabled) {
      interactableCardGroup.select(event, value);
      setSelected(!selected);
    }
    onChange?.(event);
    onClick?.(event);
  };

  let tabIndex: number;

  if (interactableCardGroup) {
    if (disabled) {
      tabIndex = -1;
    } else if (isMultiselect) {
      tabIndex = 0; // All items focusable in multi-select
    } else {
      // Single select: Only selected or first item (if none are selected) is focusable
      tabIndex = selected ? 0 : -1;
      if (!interactableCardGroup.value && isFirstChild) {
        tabIndex = 0;
      }
    }
  } else {
    tabIndex = disabled ? -1 : 0;
  }

  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(ref, cardRef);

  const { active, cardProps } = useInteractableCard({
    disabled,
    onKeyUp,
    onKeyDown,
    onBlur,
    onClick,
  });

  return (
    <div
      {...cardProps}
      role={role}
      aria-checked={ariaChecked}
      aria-disabled={disabled}
      data-value={value}
      className={clsx(
        withBaseName(),
        withBaseName(variant),
        {
          [withBaseName("accent")]: accentValue,
          [withBaseName(`accent${capitalize(accentValue ?? "")}`)]: accentValue,
          [withBaseName("active")]: role === "button" && active,
          [withBaseName("disabled")]: disabled,
          [withBaseName("selected")]: selected,
        },
        className,
      )}
      {...rest}
      onClick={handleClick}
      ref={handleRef}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
});
