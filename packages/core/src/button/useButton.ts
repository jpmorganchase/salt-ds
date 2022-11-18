import { FocusEvent, KeyboardEvent, MouseEvent } from "react";

export interface ButtonHookProps<T extends Element> {
  disabled?: boolean;
  focusableWhenDisabled?: boolean;
  onKeyUp?: (event: KeyboardEvent<T>) => void;
  onKeyDown?: (event: KeyboardEvent<T>) => void;
  onClick?: (event: MouseEvent<T>) => void;
  onBlur?: (event: FocusEvent<T>) => void;
}

export interface ButtonHookResult<T extends Element> {
  buttonProps: {
    "aria-disabled"?: boolean;
    disabled?: boolean;
    tabIndex: number;
    onBlur: (event: FocusEvent<T>) => void;
    onClick?: (event: MouseEvent<T>) => void;
    onKeyDown: (event: KeyboardEvent<T>) => void;
    onKeyUp: (event: KeyboardEvent<T>) => void;
  };
}

export const useButton = <T extends Element>({
  disabled,
  focusableWhenDisabled,
  onKeyUp,
  onKeyDown,
  onClick,
  onBlur,
}: ButtonHookProps<T>): ButtonHookResult<T> => {
  const handleKeyUp = (event: KeyboardEvent<T>) => onKeyUp?.(event);

  const handleClick = (event: MouseEvent<T>) => onClick?.(event);

  const handleBlur = (event: FocusEvent<T>) => onBlur?.(event);

  const handleKeyDown = (event: KeyboardEvent<T>) => onKeyDown?.(event);

  const buttonProps = {
    "aria-disabled": disabled,
    disabled: disabled && !focusableWhenDisabled,
    tabIndex: disabled && !focusableWhenDisabled ? -1 : 0,
    onBlur: handleBlur,
    onClick: !disabled ? handleClick : undefined,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
  };

  return { buttonProps };
};
