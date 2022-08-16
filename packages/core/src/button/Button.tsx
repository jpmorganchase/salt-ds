import {
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  Ref,
  useEffect,
  useState,
} from "react";
import cx from "classnames";
import { makePrefixer } from "../utils";

import "./Button.css";

const withBaseName = makePrefixer("uitkButton");

export const ButtonVariantValues = ["primary", "secondary", "cta"] as const;
export type ButtonVariant = typeof ButtonVariantValues[number];

export interface ButtonBaseProps {
  /**
   * If `true`, the button will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the button will be focusable when disabled.
   */
  focusableWhenDisabled?: boolean;

  onBlur?: (evt: FocusEvent<HTMLButtonElement>) => void;
  onClick?: (evt: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (evt: KeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp?: (evt: KeyboardEvent<HTMLButtonElement>) => void;
  /**
   * The variant to use. Options are 'primary', 'secondary' and 'cta'.
   * 'primary' is the default value.
   */
  variant?: ButtonVariant;
}

export type ButtonProps = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ButtonBaseProps>;

type PolymorphicButton = (
  p: ButtonProps & { ref?: Ref<HTMLButtonElement> }
) => ReactElement<ButtonProps>;

export const Button = forwardRef(function Button(
  {
    children,
    className,
    disabled,
    focusableWhenDisabled,
    onKeyUp,
    onKeyDown,
    onBlur,
    onClick,
    role: roleProp,
    variant = "primary",
    ...restProps
  }: ButtonProps,
  ref?: Ref<HTMLButtonElement>
): ReactElement<ButtonProps> {
  const [keyIsDown, setkeyIsDown] = useState("");
  const [active, setActive] = useState(false);

  const enter = "Enter";
  const space = " ";

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

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    setkeyIsDown("");
    setActive(false);
    if (onKeyUp) {
      onKeyUp?.(event);
    }
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setActive(true);
    if (onClick) {
      onClick?.(event);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    setActive(false);
    if (onBlur) {
      onBlur?.(event);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // for Pill component, which depends on Button
    if (
      !disabled &&
      // Don't act on children component
      event.target === event.currentTarget &&
      (event.key === enter || event.key === space)
    ) {
      //@ts-ignore
      onClick?.(event);
    }

    if (event.key === enter || event.key === space) {
      setkeyIsDown(event.key);
      setActive(true);
    }

    onKeyDown?.(event);
  };

  // Allow an explicit null value to be passed by user to suppress role
  const role = roleProp !== undefined ? roleProp : "button";

  return (
    <button
      aria-disabled={disabled}
      className={cx(withBaseName(), className, withBaseName(variant), {
        [withBaseName("disabled")]: disabled,
        [withBaseName("active")]: active,
      })}
      disabled={disabled && !focusableWhenDisabled}
      tabIndex={disabled && !focusableWhenDisabled ? -1 : 0}
      onBlur={handleBlur}
      onClick={!disabled ? handleClick : undefined}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      role={role}
      {...restProps}
      ref={ref}
    >
      <span className={withBaseName("label")}>{children}</span>
    </button>
  );
}) as PolymorphicButton;
