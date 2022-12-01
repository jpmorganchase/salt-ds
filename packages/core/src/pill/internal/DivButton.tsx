import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  KeyboardEvent,
} from "react";
import { useButton } from "../../button/useButton";
import cx from "classnames";
import { makePrefixer } from "../../utils";

const withBaseName = makePrefixer("uitkButton");

export interface DivButtonProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the button will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the button will be focusable when disabled.
   */
  focusableWhenDisabled?: boolean;
}

export const DivButton = forwardRef<HTMLDivElement, DivButtonProps>(
  function DivButton(
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
      ...restProps
    },
    ref?
  ): ReactElement<DivButtonProps> {
    const enter = "Enter";
    const space = " ";

    const handleKeyDownDiv = (event: KeyboardEvent<HTMLDivElement>) => {
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

      onKeyDown?.(event);
    };

    const { active, buttonProps } = useButton({
      disabled,
      focusableWhenDisabled,
      onKeyUp,
      onKeyDown: handleKeyDownDiv,
      onBlur,
      onClick,
    });

    const {
      "aria-disabled": ariaDisabled,
      tabIndex,
      onBlur: handleBlur,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
    } = buttonProps;

    return (
      <div
        aria-disabled={ariaDisabled}
        className={cx(withBaseName(), className, withBaseName("primary"), {
          [withBaseName("disabled")]: disabled,
          [withBaseName("active")]: active,
        })}
        tabIndex={tabIndex}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        // Allow an explicit null value to be passed by user to suppress role
        role={roleProp !== undefined ? roleProp : "button"}
        {...restProps}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
