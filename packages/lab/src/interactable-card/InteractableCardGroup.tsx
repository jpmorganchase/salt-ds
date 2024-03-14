import {
  ComponentPropsWithoutRef,
  forwardRef,
  SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { makePrefixer, useControlled, useForkRef } from "@salt-ds/core";
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
    (id: InteractableCardValue) =>
      selectionVariant === "multiselect"
        ? Array.isArray(value) && value.includes(id)
        : value === id,
    [value, selectionVariant]
  );

  const isFirstChild = useCallback(
    (id: InteractableCardValue) => {
      const elements: HTMLElement[] = Array.from(
        groupRef.current?.querySelectorAll(
          ".saltInteractableCard:not([disabled])"
        ) ?? []
      );

      console.log({ elements, value });
      // console.log(elements[0].getAttribute("data-value"));
      console.log(
        elements.findIndex(
          (element) => element.getAttribute("data-value") === value
        ) === 0
      );
      return (
        elements.findIndex(
          (element) => element.getAttribute("data-value") === value
        ) === 0
      );
    },
    [value]
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
    [select, isSelected, disabled, selectionVariant]
  );

  const handleKeyDownSingle = (event: KeyboardEvent<HTMLDivElement>) => {
    const elements: HTMLElement[] = Array.from(
      groupRef.current?.querySelectorAll(
        ".saltInteractableCard:not([disabled])"
      ) ?? []
    );

    console.log({ elements });
    const currentIndex = elements.findIndex(
      (element) => element === document.activeElement
    );
    const nextIndex = (currentIndex + 1) % elements.length;
    const prevIndex = (currentIndex - 1 + elements.length) % elements.length;

    const toggleSelect = () => {
      event.preventDefault();
      select(event, elements[currentIndex].getAttribute("data-value"));
    };

    switch (event.key) {
      case " ":
        toggleSelect();
        break;
      case "ArrowDown":
      case "ArrowRight":
        // Select the next element
        const nextValue = elements[nextIndex].getAttribute("data-value");
        select(event, nextValue); // Ensure your select method can handle this value appropriately
        elements[nextIndex]?.focus();
        break;
      case "ArrowUp":
      case "ArrowLeft":
        // Select the previous element
        const prevValue = elements[prevIndex].getAttribute("data-value");
        select(event, prevValue); // Adjust select method accordingly
        elements[prevIndex]?.focus();
        break;
    }

    onKeyDown?.(event);
  };

  const handleKeyDownMulti = (event: KeyboardEvent<HTMLDivElement>) => {
    const elements: HTMLElement[] = Array.from(
      groupRef.current?.querySelectorAll(
        ".saltInteractableCard:not([disabled])"
      ) ?? []
    );

    console.log({ elements });
    const currentIndex = elements.findIndex(
      (element) => element === document.activeElement
    );
    const toggleSelect = () => {
      event.preventDefault();
      select(event, elements[currentIndex].getAttribute("data-value"));
    };

    switch (event.key) {
      case " ":
        toggleSelect();
        break;
    }

    onKeyDown?.(event);
  };

  return (
    <InteractableCardGroupContext.Provider value={contextValue}>
      <div
        className={clsx(withBaseName(), className)}
        role={selectionVariant === "multiselect" ? "group" : "radiogroup"}
        onKeyDown={
          selectionVariant === "single"
            ? handleKeyDownSingle
            : handleKeyDownMulti
        }
        ref={handleRef}
        {...rest}
      >
        {children}
      </div>
    </InteractableCardGroupContext.Provider>
  );
});
