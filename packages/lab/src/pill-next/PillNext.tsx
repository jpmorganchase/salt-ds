import { forwardRef, ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer, useButton } from "@salt-ds/core";
import pillCss from "./PillNext.css";

const withBaseName = makePrefixer("saltPillNext");

export const PillNext = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(function PillNext(
  {
    children,
    className,
    disabled,
    onKeyUp,
    onKeyDown,
    onClick,
    onBlur,
    ...rest
  },
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
    onKeyUp,
    onKeyDown,
    onClick,
    onBlur,
  });
  // we do not want to spread tab index in this case because the button element
  // does not require tabindex="0" attribute
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tabIndex, ...restButtonProps } = buttonProps;
  return (
    <button
      data-testid="pill"
      ref={ref}
      className={clsx(
        withBaseName(),
        {
          [withBaseName("clickable")]: Boolean(onClick),
          [withBaseName("active")]: active,
        },
        className
      )}
      {...restButtonProps}
      {...rest}
    >
      {children}
    </button>
  );
});
