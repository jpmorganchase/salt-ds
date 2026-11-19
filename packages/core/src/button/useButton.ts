import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useState,
} from "react";

export interface ButtonHookProps<T extends Element> {
  /**
   * If `true`, the button is in a loading state. It gets `data-loading` and doesn't call `onClick`.
   */
  loading?: boolean;
  /**
   * If `true`, the button is disabled and doesn't call `onClick`. Unless `focusableWhenDisabled` is `true`, it also gets the `disabled` attribute and is removed from the tab order.
   */
  disabled?: boolean;
  /**
   * If `true`, the button stays focusable when it's disabled. It gets `aria-disabled` instead of the `disabled` attribute.
   */
  focusableWhenDisabled?: boolean;
  /**
   * Callback fired when a key is released on the button.
   */
  onKeyUp?: (event: KeyboardEvent<T>) => void;
  /**
   * Callback fired when a key is pressed on the button.
   */
  onKeyDown?: (event: KeyboardEvent<T>) => void;
  /**
   * Callback fired when the button is clicked. It isn't called when the button is disabled or loading.
   */
  onClick?: (event: MouseEvent<T>) => void;
  /**
   * Callback fired when the button loses focus.
   */
  onBlur?: (event: FocusEvent<T>) => void;
}

export interface ButtonHookResult<T extends Element> {
  active: boolean;
  buttonProps: {
    "aria-disabled"?: boolean;
    "data-loading"?: boolean;
    disabled?: boolean;
    tabIndex: number;
    onBlur: (event: FocusEvent<T>) => void;
    onClick?: (event: MouseEvent<T>) => void;
    onKeyDown: (event: KeyboardEvent<T>) => void;
    onKeyUp: (event: KeyboardEvent<T>) => void;
  };
}

export const useButton = <T extends Element>({
  loading,
  disabled,
  focusableWhenDisabled,
  onKeyUp,
  onKeyDown,
  onClick,
  onBlur,
}: ButtonHookProps<T>): ButtonHookResult<T> => {
  const [keyIsDown, setKeyIsDown] = useState("");
  const [active, setActive] = useState(false);

  const enter = "Enter";
  const space = " ";

  // biome-ignore lint/correctness/useExhaustiveDependencies: active is needed to remove the active styling on mouse up
  useEffect(() => {
    const t = setTimeout(() => {
      // This key state check is to stop continual visual state change when using Enter Key, which the browser treats as both key and click events on a Button
      // This key state check also fixes Firefox Button where Space key is pressed but button fails to be in active state
      if (keyIsDown !== enter && keyIsDown !== space) {
        setActive(false);
      }
    }, 0);

    return () => {
      clearTimeout(t);
    };
  }, [active, keyIsDown]);

  const handleKeyUp = (event: KeyboardEvent<T>) => {
    setKeyIsDown("");
    setActive(false);
    onKeyUp?.(event);
  };

  const handleClick = (event: MouseEvent<T>) => {
    setActive(true);
    onClick?.(event);
  };

  const handleBlur = (event: FocusEvent<T>) => {
    setActive(false);
    onBlur?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<T>) => {
    if (event.key === enter || event.key === space) {
      setKeyIsDown(event.key);
      setActive(true);
    }

    onKeyDown?.(event);
  };

  const buttonProps = {
    "aria-disabled": disabled && focusableWhenDisabled ? true : undefined,
    "data-loading": loading,
    disabled: disabled && !focusableWhenDisabled,
    tabIndex: disabled && !focusableWhenDisabled ? -1 : 0,
    onBlur: handleBlur,
    onClick: !loading && !disabled ? handleClick : undefined,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
  };

  return {
    active,
    buttonProps,
  };
};
