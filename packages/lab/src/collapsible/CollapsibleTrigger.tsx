import { makePrefixer, type RenderPropsType, renderProps } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useCollapsibleContext } from "./CollapsibleContext";

export interface CollapsibleTriggerProps
  extends ComponentPropsWithoutRef<"button"> {
  children: ReactNode;
  render?: RenderPropsType["render"];
}

const withBaseName = makePrefixer("saltCollapsibleTrigger");

export const CollapsibleTrigger = forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(function CollapsibleTrigger(props, ref) {
  const { className, onClick, render, ...rest } = props;

  const { expanded, setExpanded, panelId } = useCollapsibleContext();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setExpanded(event, !expanded);
    onClick?.(event);
  };

  return renderProps("button", {
    ref,
    className: clsx(withBaseName(), className),
    type: "button",
    "aria-expanded": expanded,
    "aria-controls": panelId,
    onClick: handleClick,
    render,
    ...rest,
  });
});
