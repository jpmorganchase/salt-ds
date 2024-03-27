import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useState,
} from "react";

export interface CardHookProps<T extends Element> {
  disabled?: boolean;
  onKeyUp?: (event: KeyboardEvent<T>) => void;
  onKeyDown?: (event: KeyboardEvent<T>) => void;
  onClick?: (event: MouseEvent<T>) => void;
  onBlur?: (event: FocusEvent<T>) => void;
}

export interface CardHookResult<T extends Element> {
  active: boolean;
  cardProps: {
    "aria-disabled"?: boolean;
    disabled?: boolean;
    tabIndex: number;
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
      if (keyIsDown !== enter && keyIsDown !== space) {
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
    if (event.key === enter || space) {
      setkeyIsDown(event.key);
      event.preventDefault();
      setActive(true);
    }
    onKeyDown?.(event);
  };

  const cardProps = {
    "aria-disabled": disabled ? true : undefined,
    disabled: disabled,
    tabIndex: disabled ? -1 : 0,
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
