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
  useIsomorphicLayoutEffect,
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

function isSameValue(a: Value, b: Value) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length && a.every((value, index) => value === b[index])
    );
  }
  return a === b;
}

interface RegisteredButton {
  element: HTMLElement;
  value: Value;
}

const sortButtons = (buttons: RegisteredButton[]) =>
  [...buttons].sort((buttonA, buttonB) => {
    const position = buttonA.element.compareDocumentPosition(buttonB.element);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

const buttonsAreEqual = (
  buttonsA: RegisteredButton[],
  buttonsB: RegisteredButton[],
) =>
  buttonsA.length === buttonsB.length &&
  buttonsA.every((button, index) => button === buttonsB[index]);

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
  const [enabledButtons, setEnabledButtons] = useState<RegisteredButton[]>([]);

  const registerButton = useCallback(
    (buttonValue: Value, element: HTMLElement) => {
      const button = { element, value: buttonValue };
      setEnabledButtons((currentButtons) =>
        sortButtons([
          ...currentButtons.filter(
            (currentButton) => currentButton.element !== element,
          ),
          button,
        ]),
      );

      return () => {
        setEnabledButtons((currentButtons) =>
          currentButtons.includes(button)
            ? currentButtons.filter(
                (registeredButton) => registeredButton !== button,
              )
            : currentButtons,
        );
      };
    },
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-sorts registered buttons after children move.
  useIsomorphicLayoutEffect(() => {
    setEnabledButtons((currentButtons) => {
      const sortedButtons = sortButtons(currentButtons);
      return buttonsAreEqual(currentButtons, sortedButtons)
        ? currentButtons
        : sortedButtons;
    });
  }, [children]);

  const select = useCallback(
    (
      event: SyntheticEvent<HTMLButtonElement>,
      ...values: [newValue?: Value]
    ) => {
      const newValue =
        values.length === 0 ? event.currentTarget.value : values[0];
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

  const isFocused = useCallback(
    (id: Value) => {
      // Trust the focused value until buttons register (e.g. server rendering).
      if (enabledButtons.length === 0) {
        return focused === id || focused === undefined || focused === "";
      }

      const hasFocusTarget = enabledButtons.some((button) =>
        isSameValue(button.value, focused),
      );

      return isSameValue(
        hasFocusTarget ? focused : enabledButtons[0].value,
        id,
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
      registerButton,
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
      registerButton,
      select,
      sentiment,
    ],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Leave modified arrow keys (e.g. browser history shortcuts) to the browser.
    if (event.altKey || event.ctrlKey || event.metaKey) {
      onKeyDown?.(event);
      return;
    }

    const elements: HTMLElement[] = Array.from(
      groupRef.current?.querySelectorAll("button:not([disabled])") ?? [],
    );

    const doc = ownerDocument(groupRef.current);

    const currentIndex = elements.indexOf(doc.activeElement as HTMLElement);
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        if (elements.length > 0) {
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
