import { Link, makePrefixer, Text, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
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
  HTMLAnchorElement | HTMLSpanElement,
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
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);

    if (isDisclosure || !event.defaultPrevented) {
      onNavigate?.();
    }
  };
  const textOnClick = onClick as ComponentPropsWithoutRef<"span">["onClick"];

  if (current) {
    return (
      <Text
        as="span"
        aria-current="page"
        className={clsx(triggerClassName, withBaseName("current"))}
        onClick={textOnClick}
        ref={handleRef as Ref<HTMLSpanElement>}
        styleAs="label"
        {...rest}
      >
        {children}
      </Text>
    );
  }

  if (href === undefined) {
    return (
      <Text
        as="span"
        className={triggerClassName}
        onClick={textOnClick}
        ref={handleRef as Ref<HTMLSpanElement>}
        styleAs="label"
        {...rest}
      >
        {children}
      </Text>
    );
  }

  return (
    <Link
      className={clsx(triggerClassName, withBaseName("link"))}
      color={isDisclosure ? "inherit" : undefined}
      href={href}
      onClick={handleClick}
      ref={handleRef as Ref<HTMLAnchorElement>}
      render={render}
      styleAs="label"
      underline={isDisclosure ? "never" : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
});
