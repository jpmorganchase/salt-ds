import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ButtonAppearance, ButtonSentiment } from "../button";
import {
  makePrefixer,
  ownerDocument,
  useControlled,
  useForkRef,
} from "../utils";
import toggleButtonGroupCss from "./ToggleButtonGroup.css";
import {
  ToggleButtonGroupContext,
  type Value,
} from "./ToggleButtonGroupContext";

export interface ToggleButtonGroupProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * The appearance of all the toggle buttons within the group.
   * @default solid
   */
  appearance?: Extract<ButtonAppearance, "bordered" | "solid">;
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: Value;
  /**
   * If `true`, the Toggle Button Group will be disabled.
   */
  disabled?: boolean;
  /**
   * Value of the toggle button group, to be used when the component is controlled.
   */
  value?: Value;
  /**
   * Callback fired when the selection changes.
   */
  onChange?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  /**
   * If `true`, the toggle button group will be read-only.
   */
  readOnly?: boolean;
  /**
   * The orientation of the toggle buttons.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * The visual sentimenent of all the toggle buttons within the group.
   * @default neutral
   */
  sentiment?: ButtonSentiment;
}

const withBaseName = makePrefixer("saltToggleButtonGroup");

export const ToggleButtonGroup = forwardRef<
  HTMLDivElement,
  ToggleButtonGroupProps
>(function ToggleButtonGroup(props, ref) {
  const {
    appearance,
    children,
    className,
    value: valueProp,
    defaultValue,
    disabled,
    onChange,
    onKeyDown,
    orientation = "horizontal",
    readOnly,
    sentiment,
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
  const [focused, setFocused] = useState<Value>(value);

  const select = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const newValue = event.currentTarget.value;
      setValue(newValue);
      if (value !== newValue) {
        onChange?.(event);
      }
    },
    [onChange, value],
  );

  const isSelected = useCallback(
    (id: Value) => {
      return value === id;
    },
    [value],
  );

  const focus = useCallback((id: Value) => {
    setFocused(id);
  }, []);

  const isFocused = useCallback(
    (id: Value) => {
      return focused === id || !focused;
    },
    [focused],
  );

  const contextValue = useMemo(
    () => ({
      appearance,
      disabled,
      focus,
      isFocused,
      isSelected,
      orientation,
      readOnly,
      select,
      sentiment,
    }),
    [
      appearance,
      disabled,
      focus,
      isFocused,
      isSelected,
      orientation,
      readOnly,
      select,
      sentiment,
    ],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const elements: HTMLElement[] = Array.from(
      groupRef.current?.querySelectorAll("button:not([disabled])") ?? [],
    );

    const doc = ownerDocument(groupRef.current);

    const currentIndex = elements.indexOf(doc.activeElement as HTMLElement);
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
        aria-disabled={disabled}
        aria-readonly={readOnly}
        className={clsx(
          withBaseName(),
          withBaseName(orientation),
          disabled && withBaseName("disabled"),
          readOnly && withBaseName("readOnly"),
          className,
        )}
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
