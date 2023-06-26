import {
  ComponentPropsWithoutRef,
  forwardRef,
  KeyboardEvent,
  SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { makePrefixer, useControlled, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { ToggleButtonGroupContext } from "./ToggleButtonGroupContext";
import toggleButtonGroupCss from "./ToggleButtonGroup.css";

export interface ToggleButtonGroupProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: string | ReadonlyArray<string> | number | undefined;
  /**
   * If `true`, the Toggle Button Group will be disabled.
   */
  disabled?: boolean;
  /**
   * The value. Use when the component is controlled.
   */
  value?: string | ReadonlyArray<string> | number | undefined;
  /**
   * Callback fired when the selection changes.
   * @param event
   */
  onChange?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  /**
   * The orientation of the toggle buttons.
   */
  orientation?: "horizontal" | "vertical";
}

const withBaseName = makePrefixer("saltToggleButtonGroup");

export const ToggleButtonGroup = forwardRef<
  HTMLDivElement,
  ToggleButtonGroupProps
>(function ToggleButtonGroup(props, ref) {
  const {
    children,
    className,
    value: valueProp,
    defaultValue,
    disabled,
    onChange,
    onKeyDown,
    orientation = "horizontal",
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toggle-button-group",
    css: toggleButtonGroupCss,
    window: targetWindow,
  });

  const groupRef = useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(ref, groupRef);

  const [value, setValue] = useControlled({
    default: defaultValue,
    controlled: valueProp,
    name: "ToggleButtonGroup",
    state: "value",
  });
  const [focused, setFocused] = useState<
    string | ReadonlyArray<string> | number | undefined
  >(value);

  const select = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const newValue = event.currentTarget.value;
      setValue(newValue);
      if (value !== newValue) {
        onChange?.(event);
      }
    },
    [onChange, value, setValue]
  );

  const isSelected = useCallback(
    (id: string | ReadonlyArray<string> | number | undefined) => {
      return value === id;
    },
    [value]
  );

  const focus = (id: string | ReadonlyArray<string> | number | undefined) => {
    setFocused(id);
  };

  const isFocused = useCallback(
    (id: string | ReadonlyArray<string> | number | undefined) => {
      return focused === id || !focused;
    },
    [focused]
  );

  const contextValue = useMemo(
    () => ({
      select,
      isSelected,
      focus,
      isFocused,
      disabled,
    }),
    [select, isSelected, isFocused, disabled]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const elements: HTMLElement[] = Array.from(
      groupRef.current?.querySelectorAll("button:not([disabled])") ?? []
    );
    const currentIndex = elements.findIndex(
      (element) => element === document.activeElement
    );
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        elements[(currentIndex + 1) % elements.length]?.focus();
        break;
      case "ArrowUp":
      case "ArrowLeft":
        elements[
          (currentIndex - 1 + elements.length) % elements.length
        ]?.focus();
        break;
    }

    onKeyDown?.(event);
  };

  return (
    <ToggleButtonGroupContext.Provider value={contextValue}>
      <div
        className={clsx(withBaseName(), withBaseName(orientation), className)}
        role="radiogroup"
        ref={handleRef}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    </ToggleButtonGroupContext.Provider>
  );
});
