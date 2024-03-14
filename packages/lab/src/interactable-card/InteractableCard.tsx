import {
  forwardRef,
  MouseEvent,
  KeyboardEvent,
  ComponentPropsWithoutRef,
  SyntheticEvent,
  useRef,
  useLayoutEffect,
} from "react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  capitalize,
  makePrefixer,
  useControlled,
  useForkRef,
} from "@salt-ds/core";
import { useInteractableCard } from "./useInteractableCard";
import interactableCardCss from "./InteractableCard.css";
import {
  InteractableCardValue,
  useInteractableCardGroup,
} from "./InteractableCardGroupContext";

const withBaseName = makePrefixer("saltInteractableCard");

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
   * Callback fired when the selection changes.
   * @param event
   */
  onChange?: (event: SyntheticEvent<HTMLDivElement>) => void;
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary";
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
    : false;

  const disabled = interactableCardGroup?.disabled || disabledProp;

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

  const isMultiselect =
    interactableCardGroup &&
    interactableCardGroup.selectionVariant === "multiselect";

  const isFirstChild =
    interactableCardGroup && interactableCardGroup.isFirstChild(value);

  console.log({ value, isFirstChild });

  const ariaChecked =
    role === "radio" || role === "checkbox" ? selected : undefined;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (interactableCardGroup) {
      interactableCardGroup.select(event, value);
      setSelected(!selected);
    }
    onChange?.(event);
    onClick?.(event);
  };

  let tabIndex;

  if (disabled) {
    tabIndex = -1;
  } else if (isMultiselect) {
    tabIndex = 0; // All items focusable in multi-sselect
  } else {
    // Single select: Only selected or first item (if none are selected) is focusable
    tabIndex = selected ? 0 : -1;
    if (
      !interactableCardGroup?.value &&
      isFirstChild // is first card
    ) {
      tabIndex = 0;
    }
  }

  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(ref, cardRef);

  useLayoutEffect(() => {
    if (selected && cardRef.current) {
      cardRef.current.focus();
    }
  }, [selected]);

  // const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
  //   console.log("in group");
  //   const navigate = (direction: "previous" | "next") => {
  //     direction === "previous"
  //       ? interactableCardGroup?.selectPrevious()
  //       : interactableCardGroup?.selectNext();
  //     // focusCard();
  //     event.preventDefault();
  //   };

  //   const toggleSelect = () => {
  //     event.preventDefault();
  //     interactableCardGroup?.select(event, value);
  //     setSelected(!selected);
  //     onChange?.(event);
  //   };

  //   const keyActionMap: Record<string, () => void> = {
  //     " ": toggleSelect,
  //     ArrowLeft: () => !isMultiselect && navigate("previous"),
  //     ArrowRight: () => !isMultiselect && navigate("next"),
  //     ArrowUp: () => !isMultiselect && navigate("previous"),
  //     ArrowDown: () => !isMultiselect && navigate("next"),
  //   };

  //   const action = keyActionMap[event.key];
  //   if (action) {
  //     action();
  //     onKeyDown?.(event);
  //   }
  // };

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
      data-id={value}
      aria-disabled={disabled}
      data-value={value}
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
      ref={handleRef}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
});
