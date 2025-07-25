import { makePrefixer, mergeProps } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { useCollapsibleContext } from "./CollapsibleContext";

export interface CollapsibleTriggerProps
  extends ComponentPropsWithoutRef<"button"> {
  children: ReactNode;
}

const withBaseName = makePrefixer("saltCollapsibleTrigger");

export const CollapsibleTrigger = forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(function CollapsibleTrigger(props, ref) {
  const { children, className, onClick, ...rest } = props;

  const { open, setOpen, panelId } = useCollapsibleContext();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setOpen(event, !open);
    onClick?.(event);
  };

  if (!children || !isValidElement<{ ref?: Ref<unknown> }>(children)) {
    // Should we log or throw error?
    return <>{children}</>;
  }

  return cloneElement(children, {
    ...mergeProps(
      {
        className: clsx(withBaseName(), className),
        type: "button",
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: handleClick,
      },
      children.props,
    ),
    ref,
  });
});
