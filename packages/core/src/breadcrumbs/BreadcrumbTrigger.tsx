import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { makePrefixer, renderProps, useForkRef } from "../utils";
import { useBreadcrumbContext } from "./internal/BreadcrumbContext";

const withBaseName = makePrefixer("saltBreadcrumb");
const withBreadcrumbsBaseName = makePrefixer("saltBreadcrumbs");

export interface BreadcrumbTriggerProps
  extends Omit<ComponentPropsWithoutRef<"a">, "children" | "color" | "href"> {
  /**
   * Breadcrumb trigger content.
   */
  children?: ReactNode;
}

export const BreadcrumbTrigger = forwardRef<
  HTMLAnchorElement,
  BreadcrumbTriggerProps
>(function BreadcrumbTrigger(props, ref) {
  const { children, className, onClick, ...rest } = props;
  const context = useBreadcrumbContext();

  if (!context) {
    throw new Error("BreadcrumbTrigger must be rendered inside Breadcrumb");
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
