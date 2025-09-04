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
import { makePrefixer, mergeProps } from "../utils";
import { useCollapsibleContext } from "./CollapsibleContext";

export interface CollapsibleTriggerProps
  extends Pick<ComponentPropsWithoutRef<"button">, "className" | "onClick"> {
  children: ReactNode;
}

const withBaseName = makePrefixer("saltCollapsibleTrigger");

export const CollapsibleTrigger = forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(function CollapsibleTrigger(props, ref) {
  const { children, className, onClick } = props;

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
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: handleClick,
      },
      children.props,
    ),
    ref,
  });
});
