import { makePrefixer, renderProps, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { useBreadcrumbNextContext } from "./internal/BreadcrumbNextContext";

const withBaseName = makePrefixer("saltBreadcrumbNext");
const withBreadcrumbsBaseName = makePrefixer("saltBreadcrumbsNext");

export interface BreadcrumbNextTriggerProps
  extends Omit<ComponentPropsWithoutRef<"a">, "children" | "color" | "href"> {
  /**
   * Breadcrumb trigger content.
   */
  children?: ReactNode;
}

export const BreadcrumbNextTrigger = forwardRef<
  HTMLAnchorElement,
  BreadcrumbNextTriggerProps
>(function BreadcrumbNextTrigger(props, ref) {
  const { children, className, onClick, ...rest } = props;
  const context = useBreadcrumbNextContext();

  if (!context) {
    throw new Error(
      "BreadcrumbNextTrigger must be rendered inside BreadcrumbNext",
    );
  }

  const { current, href, onNavigate, placement, render, triggerRef } = context;
  const handleRef = useForkRef(ref, triggerRef);
  const isDisclosure = placement === "disclosure";
  const triggerClassName = clsx(
    isDisclosure
      ? withBreadcrumbsBaseName("disclosureItem")
      : withBaseName("trigger"),
    className,
  );
  const isNavigable = href !== undefined;
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);

    if (isDisclosure || !event.defaultPrevented) {
      onNavigate?.();
    }
  };

  return renderProps("a", {
    "aria-current": current ? "page" : undefined,
    children,
    className: clsx(triggerClassName, {
      [withBaseName("link")]: !isDisclosure && isNavigable,
      [withBaseName("current")]: current,
    }),
    href,
    onClick: isNavigable ? handleClick : onClick,
    ref: handleRef,
    render: isNavigable ? render : undefined,
    ...rest,
  });
});
