import {
  ComponentPropsWithoutRef,
  forwardRef,
  KeyboardEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { makePrefixer, useControlled, useForkRef } from "../utils";
import {
  InteractableCardGroupContext,
  SelectionVariant,
  InteractableCardValue,
} from "./InteractableCardGroupContext";
import interactableCardGroupCss from "./InteractableCardGroup.css";

export interface InteractableCardGroupProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * The default value. Use when the component is not controlled. Should be an array when `selectionVariant` is "multiselect".
   */
  defaultValue?: InteractableCardValue;
  /**
   * If `true`, the Interactable Card Group will be disabled.
   */
  disabled?: boolean;
  /**
   * The value. Use when the component is controlled.
   */
  value?: InteractableCardValue;
  /**
   * The selection variant.
   */
  selectionVariant?: SelectionVariant;
  /**
   * Callback fired when the selection changes.
   * @param event
   */
  onChange?: (
    event: SyntheticEvent<HTMLDivElement>,
    value: InteractableCardValue
  ) => void;
}

const withBaseName = makePrefixer("saltInteractableCardGroup");

export const InteractableCardGroup = forwardRef<
  HTMLDivElement,
  InteractableCardGroupProps
>(function InteractableCardGroup(props, ref) {
  const {
    children,
    className,
    value: valueProp,
    defaultValue,
    disabled,
    onChange,
    onKeyDown,
    selectionVariant = "single",
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-interactable-card-group",
    css: interactableCardGroupCss,
    window: targetWindow,
  });

  const groupRef = useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(ref, groupRef);

  const [value, setValue] = useControlled({
    default: defaultValue,
    controlled: valueProp,
    name: "InteractableCardGroup",
    state: "value",
  });

  const [elements, setElements] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const childElements: HTMLElement[] = Array.from(
      groupRef.current?.querySelectorAll(
        ".saltInteractableCard:not([disabled])"
      ) ?? []
    );
    setElements(childElements);
  }, [children]);

  const select = useCallback(
    (
      event: SyntheticEvent<HTMLDivElement>,
      newValue: InteractableCardValue
    ) => {
      if (selectionVariant === "multiselect") {
        const currentValues = Array.isArray(value) ? value : [];
        const isSelected = currentValues.includes(newValue);

        const nextValues = isSelected
          ? currentValues.filter((val) => val !== newValue)
          : [...currentValues, newValue];
        setValue(nextValues);
        onChange?.(event, nextValues);
      } else {
        setValue(newValue);
        if (value !== newValue) {
          onChange?.(event, newValue);
        }
      }
    },
    [onChange, value, setValue, selectionVariant]
  );

  const isSelected = useCallback(
    (cardValue: InteractableCardValue) =>
      selectionVariant === "multiselect"
        ? Array.isArray(value) && value.includes(cardValue)
        : cardValue !== undefined && value === cardValue,
    [value, selectionVariant]
  );

  const isFirstChild = useCallback(
    (cardValue: InteractableCardValue) => {
      return (
        elements.findIndex(
          (element) => element.getAttribute("data-value") === cardValue
        ) === 0
      );
    },
    [elements]
  );

  const contextValue = useMemo(
    () => ({
      select,
      isSelected,
      isFirstChild,
      disabled,
      selectionVariant,
      value,
    }),
    [select, isSelected, disabled, selectionVariant, isFirstChild, value]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = elements.findIndex(
      (element) => element === document.activeElement
    );
    const nextIndex = (currentIndex + 1) % elements.length;
    const prevIndex = (currentIndex - 1 + elements.length) % elements.length;

    if (event.key == " ") {
      event.preventDefault();
      select(
        event,
        elements[currentIndex].getAttribute(
          "data-value"
        ) as InteractableCardValue
      );
    }

    if (selectionVariant === "single") {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          const nextValue = elements[nextIndex].getAttribute(
            "data-value"
          ) as InteractableCardValue;
          select(event, nextValue);
          elements[nextIndex]?.focus();
          break;
        case "ArrowUp":
        case "ArrowLeft":
          const prevValue = elements[prevIndex].getAttribute(
            "data-value"
          ) as InteractableCardValue;
          select(event, prevValue);
          elements[prevIndex]?.focus();
          break;
      }
    }
    onKeyDown?.(event);
  };

  return (
    <InteractableCardGroupContext.Provider value={contextValue}>
      <div
        className={clsx(withBaseName(), className)}
        role={selectionVariant === "multiselect" ? "group" : "radiogroup"}
        onKeyDown={handleKeyDown}
        ref={handleRef}
        {...rest}
      >
        {children}
      </div>
    </InteractableCardGroupContext.Provider>
  );
});
