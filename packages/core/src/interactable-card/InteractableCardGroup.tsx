import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { makePrefixer, useControlled, useForkRef } from "../utils";
import interactableCardGroupCss from "./InteractableCardGroup.css";
import {
  InteractableCardGroupContext,
  type InteractableCardValue,
} from "./InteractableCardGroupContext";

export interface InteractableCardGroupProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * The default value. Use when the component is not controlled. Should be an array when `multiSelect` is true.
   */
  defaultValue?: InteractableCardValue;
  /**
   * If `true`, the Interactable Card Group will be disabled.
   */
  disabled?: boolean;
  /**
   * The value. Use when the component is controlled. Should be an array when `multiSelect` is true.
   */
  value?: InteractableCardValue;
  /**
   * If `true` the Interactable Card Group will allow multiple selection functionality, with keyboard interactions matching those of a checkbox.
   * By default the group allows mutually exclusive selection with keyboard interactions matching radio buttons.
   */
  multiSelect?: boolean;
  /**
   * Callback fired when the selection changes.
   * @param event
   */
  onChange?: (
    event: SyntheticEvent<HTMLDivElement>,
    value: InteractableCardValue,
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
    multiSelect,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: queries the dom when children changes.
  useEffect(() => {
    const childElements: HTMLElement[] = Array.from(
      groupRef.current?.querySelectorAll(
        ".saltInteractableCard:not([disabled])",
      ) ?? [],
    );
    setElements(childElements);
  }, [children]);

  const select = useCallback(
    (
      event: SyntheticEvent<HTMLDivElement>,
      newValue: InteractableCardValue,
    ) => {
      if (multiSelect) {
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
    [onChange, value, multiSelect],
  );

  const isSelected = useCallback(
    (cardValue: InteractableCardValue) =>
      multiSelect
        ? Array.isArray(value) && value.includes(cardValue)
        : cardValue !== undefined && value === cardValue,
    [value, multiSelect],
  );

  const isFirstChild = useCallback(
    (cardValue: InteractableCardValue) => {
      return (
        elements.findIndex(
          (element) => element.getAttribute("data-value") === cardValue,
        ) === 0
      );
    },
    [elements],
  );

  const contextValue = useMemo(
    () => ({
      select,
      isSelected,
      isFirstChild,
      disabled,
      multiSelect,
      value,
    }),
    [select, isSelected, disabled, multiSelect, isFirstChild, value],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = elements.findIndex(
      (element) => element === document.activeElement,
    );
    const nextIndex = (currentIndex + 1) % elements.length;
    const prevIndex = (currentIndex - 1 + elements.length) % elements.length;

    if (event.key === " ") {
      event.preventDefault();
      select(
        event,
        elements[currentIndex].getAttribute(
          "data-value",
        ) as InteractableCardValue,
      );
    }

    if (!multiSelect) {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          select(
            event,
            elements[nextIndex].getAttribute(
              "data-value",
            ) as InteractableCardValue,
          );
          elements[nextIndex]?.focus();
          break;
        case "ArrowUp":
        case "ArrowLeft":
          select(
            event,
            elements[prevIndex].getAttribute(
              "data-value",
            ) as InteractableCardValue,
          );
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
        role={multiSelect ? "group" : "radiogroup"}
        onKeyDown={handleKeyDown}
        ref={handleRef}
        {...rest}
      >
        {children}
      </div>
    </InteractableCardGroupContext.Provider>
  );
});
