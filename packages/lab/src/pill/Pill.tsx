import {
  forwardRef,
  MouseEvent,
  PropsWithChildren,
  KeyboardEvent,
  ComponentPropsWithoutRef,
} from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer, useButton } from "@salt-ds/core";
import pillCss from "./Pill.css";

export type PillClickEvent =
  | MouseEvent<Element, globalThis.MouseEvent>
  | KeyboardEvent<HTMLDivElement>;

export interface PillProps extends ComponentPropsWithoutRef<"div"> {
  /* If true the pill will be disabled */
  disabled?: boolean;
  className?: string;
  /* Pass an element to render an icon descriptor on the left of the label */
  icon?: React.ReactNode;
  /* Pass a callback function to make the pill clickable */
  onClick?: (event: PillClickEvent) => void;
}

const withBaseName = makePrefixer("saltPill");

export const Pill = forwardRef<HTMLDivElement, PropsWithChildren<PillProps>>(
  function Pill(
    { onClick, children, className, icon, disabled, ...restProps },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill",
      css: pillCss,
      window: targetWindow,
    });
    const {
      buttonProps: { disabled: disabledAttribute, ...buttonProps },
      active,
    } = useButton<HTMLDivElement>({
      disabled,
      onClick,
      onKeyUp: (event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          onClick?.(event);
        }
        restProps.onKeyUp?.(event);
      },
      onKeyDown: restProps.onKeyDown,
    });

    return (
      <div
        data-testid="pill"
        ref={ref}
        role="button"
        className={clsx(
          withBaseName(),
          withBaseName("clickable"),
          {
            [withBaseName("active")]: active,
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        {...buttonProps}
        aria-disabled={disabled ? true : undefined}
        {...restProps}
      >
        {icon}
        <span className={withBaseName("label")}>{children}</span>
      </div>
    );
  }
);
