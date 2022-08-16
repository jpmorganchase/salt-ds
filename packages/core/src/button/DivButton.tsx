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
import { ButtonVariant } from "./Button";

const withBaseName = makePrefixer("uitkButton");

export interface DivButtonBaseProps {
  /**
   * If `true`, the button will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the button will be focusable when disabled.
   */
  focusableWhenDisabled?: boolean;

  onBlur?: (evt: FocusEvent<HTMLDivElement>) => void;
  onClick?: (evt: MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (evt: KeyboardEvent<HTMLDivElement>) => void;
  onKeyUp?: (evt: KeyboardEvent<HTMLDivElement>) => void;
  /**
   * The variant to use. Options are 'primary', 'secondary' and 'cta'.
   * 'primary' is the default value.
   */
  variant?: ButtonVariant;
}

export type DivButtonProps = DivButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof DivButtonBaseProps>;

export const DivButton = forwardRef(function DivButton(
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
  }: DivButtonProps,
  ref?: Ref<HTMLDivElement>
): ReactElement<DivButtonProps> {
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

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    setkeyIsDown("");
    setActive(false);
    if (onKeyUp) {
      onKeyUp?.(event);
    }
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    setActive(true);
    if (onClick) {
      onClick?.(event);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    setActive(false);
    if (onBlur) {
      onBlur?.(event);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
    <div
      aria-disabled={disabled}
      className={cx(withBaseName(), className, withBaseName(variant), {
        [withBaseName("disabled")]: disabled,
        [withBaseName("active")]: active,
      })}
      tabIndex={disabled && !focusableWhenDisabled ? -1 : 0}
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      role={role}
      {...restProps}
      ref={ref}
    >
      <span className={withBaseName("label")}>{children}</span>
    </div>
  );
});
