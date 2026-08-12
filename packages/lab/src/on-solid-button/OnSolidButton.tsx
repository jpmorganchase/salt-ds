import { makePrefixer, useButton } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import onSolidButtonCss from "./OnSolidButton.css";

const withBaseName = makePrefixer("saltOnSolidButton");

export interface OnSolidButtonProps extends ComponentPropsWithoutRef<"button"> {
  disabled?: boolean;
  focusableWhenDisabled?: boolean;
}

export const OnSolidButton = forwardRef<HTMLButtonElement, OnSolidButtonProps>(
  function OnSolidButton(
    {
      children,
      className,
      disabled,
      focusableWhenDisabled,
      onBlur,
      onClick,
      onKeyDown,
      onKeyUp,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-on-solid-button",
      css: onSolidButtonCss,
      window: targetWindow,
    });

    const { active, buttonProps } = useButton<HTMLButtonElement>({
      disabled,
      focusableWhenDisabled,
      onBlur,
      onClick,
      onKeyDown,
      onKeyUp,
    });

    const { tabIndex: _tabIndex, ...restButtonProps } = buttonProps;

    return (
      <button
        {...restButtonProps}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("active")]: active,
            [withBaseName("disabled")]: disabled,
          },
          className,
        )}
        {...rest}
        ref={ref}
        type={type}
      >
        {children}
      </button>
    );
  },
);
