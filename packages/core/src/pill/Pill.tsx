import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { useButton } from "../button";
import { makePrefixer } from "../utils";
import pillCss from "./Pill.css";

const withBaseName = makePrefixer("saltPill");

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
  ref,
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
  const { tabIndex: _tabIndex, ...restButtonProps } = buttonProps;
  return (
    <button
      data-testid="pill"
      ref={ref}
      className={clsx(
        withBaseName(),
        withBaseName("clickable"),
        { [withBaseName("active")]: active },
        className,
      )}
      type="button"
      {...restButtonProps}
      {...rest}
    >
      {children}
    </button>
  );
});
