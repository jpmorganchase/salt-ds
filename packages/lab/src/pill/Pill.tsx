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
import { makePrefixer } from "@salt-ds/core";
import pillCss from "./Pill.css";
import { InteractivePill } from "./InteractivePill";

export type PillClickEvent =
  | MouseEvent<Element, globalThis.MouseEvent>
  | KeyboardEvent<HTMLDivElement>;

export interface PillProps extends ComponentPropsWithoutRef<"div"> {
  /* If true the pill will be disabled */
  disabled?: boolean;
  className?: string;
  /* Pass an element to render an icon descriptor on the left of the label */
  icon?: React.ReactNode;
  /* 
    Pass a callback function to render a close button on the right of the label. 
    Pill can also be closed by pressing Backspace or Delete when Pill is focused. 
  */
  onClose?: (e: PillClickEvent | KeyboardEvent<HTMLDivElement>) => void;
  /* Pass a callback function to make the pill clickable */
  onClick?: (e: PillClickEvent) => void;
}

const withBaseName = makePrefixer("saltPill");

export const Pill = forwardRef<HTMLDivElement, PropsWithChildren<PillProps>>(
  function Pill(
    { onClose, onClick, children, className, icon, disabled, ...rest },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill",
      css: pillCss,
      window: targetWindow,
    });

    const clickable = onClick !== undefined;
    const closable = onClose !== undefined;
    const interactive = clickable || closable;

    if (interactive) {
      return (
        <InteractivePill
          onClose={onClose}
          onClick={onClick}
          className={className}
          icon={icon}
          disabled={disabled}
          {...rest}
        >
          {children}
        </InteractivePill>
      );
    }

    return (
      <div
        data-testid="pill"
        ref={ref}
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        {icon}
        <span className={withBaseName("label")}>{children}</span>
      </div>
    );
  }
);
