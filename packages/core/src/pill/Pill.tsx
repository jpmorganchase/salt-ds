import { forwardRef, ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import pillCss from "./Pill.css";
import { makePrefixer } from "../utils";
import { useButton } from "../button";

const withBaseName = makePrefixer("saltPill");

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface PillProps extends ComponentPropsWithoutRef<"button"> {}

export const Pill = forwardRef<HTMLButtonElement, PillProps>(function Pill(
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
    testId: "salt-pill",
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
        withBaseName("clickable"),
        { [withBaseName("active")]: active },
        className
      )}
      {...restButtonProps}
      {...rest}
    >
      {children}
    </button>
  );
});
