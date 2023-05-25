import {
  ComponentPropsWithoutRef,
  forwardRef,
  KeyboardEvent,
  SyntheticEvent,
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
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The default selected value. Use when the component is not controlled.
   */
  defaultSelected?: string | ReadonlyArray<string> | number | undefined;
  /**
   * If `true`, the Toggle Button Group will be disabled.
   */
  disabled?: boolean;
  /**
   * The selected value. Use when the component is controlled.
   */
  selected?: string | ReadonlyArray<string> | number | undefined;
  /**
   * Callback fired when the selection changes.
   * @param event
   */
  onSelectionChange?: (event: SyntheticEvent<HTMLButtonElement>) => void;
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
    selected: selectedProp,
    defaultSelected,
    disabled,
    onSelectionChange,
    onKeyDown,
    orientation = "horizontal",
    style: styleProp,
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

  const [selected, setSelected] = useControlled({
    default: defaultSelected,
    controlled: selectedProp,
    name: "ToggleButtonGroup",
    state: "selected",
  });
  const [focused, setFocused] = useState<
    string | ReadonlyArray<string> | number | undefined
  >(selected);

  const select = (event: SyntheticEvent<HTMLButtonElement>) => {
    const newValue = event.currentTarget.value;
    setSelected(newValue);
    if (selected !== newValue) {
      onSelectionChange?.(event);
    }
  };

  const isSelected = (
    id: string | ReadonlyArray<string> | number | undefined
  ) => {
    return selected === id;
  };

  const focus = (id: string | ReadonlyArray<string> | number | undefined) => {
    setFocused(id);
  };

  const isFocused = (
    id: string | ReadonlyArray<string> | number | undefined
  ) => {
    return focused === id || !focused;
  };

  const value = useMemo(
    () => ({
      select,
      isSelected,
      focus,
      isFocused,
      disabled,
    }),
    [select, isSelected, focus, disabled]
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

  const style = {
    "--saltToggleButtonGroup-flexDirection":
      orientation === "vertical" ? "column" : "row",
    ...styleProp,
  };

  return (
    <ToggleButtonGroupContext.Provider value={value}>
      <div
        className={clsx(withBaseName(), className)}
        role="radiogroup"
        ref={handleRef}
        onKeyDown={handleKeyDown}
        style={style}
        {...rest}
      >
        {children}
      </div>
    </ToggleButtonGroupContext.Provider>
  );
});
