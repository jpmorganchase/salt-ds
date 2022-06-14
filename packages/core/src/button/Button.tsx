import {
  ComponentPropsWithoutRef,
  ElementType,
  FocusEvent,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import cx from "classnames";
import { inferElementType, makePrefixer, polymorphicRef } from "../utils";

import "./Button.css";

const withBaseName = makePrefixer("uitkButton");

export const ButtonVariantValues = ["primary", "secondary", "cta"] as const;
export type ButtonVariant = typeof ButtonVariantValues[number];

export interface ButtonBaseProps<T extends ElementType> {
  /**
   * By default, root element of Button will be a `button` HTMLElement. This behaviour
   * can be changed by passing a value to elementType. This can be a string
   * representing an alternative html element  e.g `"a"`, `"div"`. It can also be a
   * React component eg RouterLink. If root element is not `button` or `a`, the
   * aria button role will be assigned to the root element.
   */
  elementType?: T;
  /**
   * If `true`, the button will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the button will be focusable when disabled.
   */
  focusableWhenDisabled?: boolean;
  onBlur?: (evt: FocusEvent<inferElementType<T>>) => void;
  onClick?: (evt: MouseEvent<inferElementType<T>>) => void;
  onKeyDown?: (evt: KeyboardEvent<inferElementType<T>>) => void;
  onKeyUp?: (evt: KeyboardEvent<inferElementType<T>>) => void;
  /**
   * The variant to use. Options are 'primary', 'secondary' and 'cta'.
   * 'primary' is the default value.
   */
  variant?: ButtonVariant;
}

export type ButtonProps<T extends ElementType = "button"> = ButtonBaseProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonBaseProps<T>>;

type PolymorphicButton = <T extends ElementType = "button">(
  p: ButtonProps<T> & { ref?: polymorphicRef<T> }
) => ReactElement<ButtonProps<T>>;

export const Button = forwardRef(function Button<
  T extends ElementType = "button"
>(
  {
    children,
    className,
    disabled,
    elementType,
    focusableWhenDisabled,
    onKeyUp,
    onKeyDown,
    onBlur,
    onClick,
    role: roleProp,
    variant = "primary",
    ...restProps
  }: ButtonProps<T>,
  ref?: polymorphicRef<T>
): ReactElement<ButtonProps<T>> {
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

  const handleKeyUp = (event: KeyboardEvent<inferElementType<T>>) => {
    setkeyIsDown("");
    setActive(false);
    if (onKeyUp) {
      onKeyUp?.(event);
    }
  };

  const handleClick = (event: MouseEvent<inferElementType<T>>) => {
    setActive(true);
    if (onClick) {
      onClick?.(event);
    }
  };

  const handleBlur = (event: FocusEvent<inferElementType<T>>) => {
    setActive(false);
    if (onBlur) {
      onBlur?.(event);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<inferElementType<T>>) => {
    // for Pill component, which depends on Button
    if (
      !disabled &&
      // Don't act on children component
      event.target === event.currentTarget &&
      // `button` and `a` would be handled by default
      Component !== "button" &&
      Component !== "a" &&
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

  const Component: ElementType = elementType || "button";
  // Allow an explicit null value to be passed by user to suppress role
  const role =
    roleProp !== undefined
      ? roleProp
      : Component === "button" || Component === "a"
      ? undefined
      : "button";

  return (
    <Component
      aria-disabled={disabled}
      className={cx(withBaseName(), className, withBaseName(variant), {
        [withBaseName("disabled")]: disabled,
        [withBaseName("active")]: active,
      })}
      disabled={disabled && !focusableWhenDisabled}
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
    </Component>
  );
}) as PolymorphicButton;
