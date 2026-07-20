import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

const withBaseName = makePrefixer("saltBreadcrumbNext");

export interface BreadcrumbNextLabelProps
  extends ComponentPropsWithoutRef<"span"> {}

export const BreadcrumbNextLabel = forwardRef<
  HTMLSpanElement,
  BreadcrumbNextLabelProps
>(function BreadcrumbNextLabel({ className, ...rest }, ref) {
  return (
    <span
      ref={ref}
      className={clsx(withBaseName("label"), className)}
      {...rest}
    />
  );
});
