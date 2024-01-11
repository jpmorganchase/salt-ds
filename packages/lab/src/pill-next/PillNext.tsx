import { forwardRef, ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer, useButton } from "@salt-ds/core";
import pillCss from "./PillNext.css";

export interface PillNextProps extends ComponentPropsWithoutRef<"button"> {
  /* If true the pill will be disabled */
  disabled?: boolean;
}

const withBaseName = makePrefixer("saltPillNext");

export const PillNext = forwardRef<HTMLButtonElement, PillNextProps>(
  function PillNext(
    { children, className, disabled, onClick, ...restProps },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill-next",
      css: pillCss,
      window: targetWindow,
    });
    const { buttonProps, active } = useButton<HTMLButtonElement>({
      disabled,
      onClick,
      ...restProps,
    });
    // we do not want to spread tab index in this case because the button element
    // does not require tabindex="0" attribute
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tabIndex, ...restButtonProps } = buttonProps;
    return (
      <button
        data-testid="pill"
        ref={ref}
        className={clsx(withBaseName(), className, {
          [withBaseName("clickable")]: Boolean(onClick),
          [withBaseName("active")]: active,
          [withBaseName("disabled")]: disabled,
        })}
        {...restButtonProps}
        {...restProps}
      >
        {children}
      </button>
    );
  }
);
