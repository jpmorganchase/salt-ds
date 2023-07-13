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
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  onClose?: (e: PillClickEvent | KeyboardEvent<HTMLDivElement>) => void;
  onClick?: (e: PillClickEvent) => void;
}

const withBaseName = makePrefixer("saltPill");

export const Pill = forwardRef<HTMLDivElement, PropsWithChildren<PillProps>>(
  function Pill({ onClose, onClick, children, className, icon, ...rest }, ref) {
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
          {...rest}
        >
          {children}
        </InteractivePill>
      );
    }

    return (
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
        {icon}
        <span className={withBaseName("label")}>{children}</span>
      </div>
    );
  }
);
