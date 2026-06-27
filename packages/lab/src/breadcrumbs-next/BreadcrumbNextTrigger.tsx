import { Link, makePrefixer, Text, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  type Ref,
} from "react";
import { useBreadcrumbNextContext } from "./internal/BreadcrumbNextContext";

const withBaseName = makePrefixer("saltBreadcrumbNext");

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
  const { children, className, ...rest } = props;
  const context = useBreadcrumbNextContext();

  if (!context) {
    throw new Error(
      "BreadcrumbNextTrigger must be rendered inside BreadcrumbNext",
    );
  }

  const { current, href, render, triggerRef } = context;
  const handleRef = useForkRef(ref, triggerRef);
  const triggerClassName = clsx(withBaseName("trigger"), className);

  if (current) {
    return (
      <Text
        as="span"
        aria-current="page"
        className={clsx(triggerClassName, withBaseName("current"))}
        ref={handleRef as Ref<HTMLSpanElement>}
        styleAs="label"
        {...rest}
      >
        {children}
      </Text>
    );
  }

  if (href === undefined && render === undefined) {
    return (
      <Text
        as="span"
        className={triggerClassName}
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
      href={href}
      ref={handleRef as Ref<HTMLAnchorElement>}
      render={render}
      styleAs="label"
      {...rest}
    >
      {children}
    </Link>
  );
});
