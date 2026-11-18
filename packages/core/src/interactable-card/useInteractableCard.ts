import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useState,
} from "react";

export interface CardHookProps<T extends Element> {
  /**
   * If `true`, the card is disabled. The returned `cardProps` set `aria-disabled`, don't make the card focusable, and don't call `onClick` on click or when `Enter` or `Space` is pressed.
   */
  disabled?: boolean;
  /**
   * Callback fired when a key is released on the card.
   */
  onKeyUp?: (event: KeyboardEvent<T>) => void;
  /**
   * Callback fired when a key is pressed on the card.
   */
  onKeyDown?: (event: KeyboardEvent<T>) => void;
  /**
   * Callback fired when the card is clicked, or when `Enter` or `Space` is pressed on it. It isn't fired when the card is disabled.
   * @param event - The click event. When the card is activated with `Enter` or `Space`, it's the keyboard event.
   */
  onClick?: (event: MouseEvent<T>) => void;
  /**
   * Callback fired when the card loses focus.
   */
  onBlur?: (event: FocusEvent<T>) => void;
}

export interface CardHookResult<T extends Element> {
  active: boolean;
  cardProps: {
    "aria-disabled"?: boolean;
    tabIndex?: number;
    onBlur: (event: FocusEvent<T>) => void;
    onClick?: (event: MouseEvent<T>) => void;
    onKeyDown: (event: KeyboardEvent<T>) => void;
    onKeyUp: (event: KeyboardEvent<T>) => void;
  };
}

export const useInteractableCard = <T extends Element>({
  disabled,
  onKeyUp,
  onKeyDown,
  onClick,
  onBlur,
}: CardHookProps<T>): CardHookResult<T> => {
  const [keyIsDown, setkeyIsDown] = useState("");
  const [active, setActive] = useState(false);

  const enter = "Enter";
  const space = " ";

  useEffect(() => {
    const t = setTimeout(() => {
      // This key state check is to stop continual visual state change when using Enter Key, which the browser treats as both key and click events on a Button-like component
      // This key state check also fixes Firefox Button where Space key is pressed but button fails to be in active state
      if (keyIsDown !== enter && keyIsDown !== space && active) {
        setActive(false);
      }
    }, 0);

    return () => {
      clearTimeout(t);
    };
  }, [active, keyIsDown]);

  const handleKeyUp = (event: KeyboardEvent<T>) => {
    setkeyIsDown("");
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
    if (!disabled && (event.key === enter || event.key === space)) {
      setkeyIsDown(event.key);
      event.preventDefault();
      setActive(true);
      onClick?.(event as unknown as MouseEvent<T>);
    }
    onKeyDown?.(event);
  };

  const cardProps = {
    "aria-disabled": disabled ? true : undefined,
    tabIndex: disabled ? undefined : 0,
    onBlur: handleBlur,
    onClick: !disabled ? handleClick : undefined,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
  };

  return {
    active,
    cardProps,
  };
};
