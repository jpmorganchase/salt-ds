import {
  forwardRef,
  MouseEvent,
  KeyboardEvent,
  ComponentPropsWithoutRef,
} from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer, useButton } from "@salt-ds/core";
import pillCss from "./PillNext.css";

export type PillClickEvent =
  | MouseEvent<Element, globalThis.MouseEvent>
  | KeyboardEvent<HTMLDivElement>;

export interface PillNextProps extends ComponentPropsWithoutRef<"button"> {
  /* If true the pill will be disabled */
  disabled?: boolean;
  /* Pass an element to render an icon descriptor on the left of the label */
  icon?: React.ReactNode;
}

const withBaseName = makePrefixer("saltPillNext");

export const PillNext = forwardRef<HTMLButtonElement, PillNextProps>(
  function PillNext(
    { children, className, icon, disabled, ...restProps },
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
      ...restProps,
    });
    // we do not want to spread tab index in this case because the button element
    // does not require tabindex="0" attribute
    const { tabIndex, ...restButtonProps } = buttonProps;

    return (
      <button
        data-testid="pill"
        ref={ref}
        type="button"
        className={clsx(
          withBaseName(),
          withBaseName("clickable"),
          {
            [withBaseName("active")]: active,
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        {...restButtonProps}
        {...restProps}
      >
        {icon}
        <span className={withBaseName("label")}>{children}</span>
      </button>
    );
  }
);
