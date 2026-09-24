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

// `value` on a DOM button is always a string, so selecting a button whose
// `value` prop is a number stores a string on the group. Comparing both sides
// as strings keeps such a button selected, and keeps it as the tab stop.
function isSameValue(a: Value, b: Value) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

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

  const [enabledButtons, setEnabledButtons] = useState<HTMLButtonElement[]>([]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const updateEnabledButtons = () => {
      const buttons = Array.from(
        group.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
      );
      setEnabledButtons((previous) =>
        previous.length === buttons.length &&
        previous.every((button, index) => button === buttons[index])
          ? previous
          : buttons,
      );
    };

    // Descendants can change independently of this group's props.
    const observer = new MutationObserver(updateEnabledButtons);
    observer.observe(group, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled"],
    });
    updateEnabledButtons();

    return () => observer.disconnect();
  }, []);

  const select = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const newValue = event.currentTarget.value;
      setValue(newValue);
      if (!isSameValue(value, newValue)) {
        onChange?.(event);
      }
    },
    [onChange, value],
  );

  const isSelected = useCallback(
    (id: Value) => {
      return isSameValue(value, id);
    },
    [value],
  );

  const focus = useCallback((id: Value) => {
    setFocused(id);
  }, []);

  // Following the ARIA radio group pattern, the group exposes exactly one tab
  // stop: the selected button when it is enabled, otherwise the first enabled
  // button. Disabled buttons are never the tab stop, as they cannot be focused.
  const isFocused = useCallback(
    (id: Value) => {
      const hasEnabledSelection = enabledButtons.some((button) =>
        isSameValue(button.value, focused),
      );

      if (hasEnabledSelection) {
        return isSameValue(focused, id);
      }

      return (
        enabledButtons.length > 0 && isSameValue(enabledButtons[0].value, id)
      );
    },
    [focused, enabledButtons],
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
        if (elements.length > 0) {
          // The group owns the arrow keys, so stop the page scrolling.
          event.preventDefault();
          elements[(currentIndex + 1) % elements.length]?.focus();
        }
        break;
      case "ArrowUp":
      case "ArrowLeft":
        if (elements.length > 0) {
          event.preventDefault();
          elements[
            (currentIndex - 1 + elements.length) % elements.length
          ]?.focus();
        }
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
