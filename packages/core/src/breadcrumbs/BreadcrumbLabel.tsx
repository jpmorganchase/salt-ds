import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";

const withBaseName = makePrefixer("saltBreadcrumb");

export interface BreadcrumbLabelProps
  extends ComponentPropsWithoutRef<"span"> {}

export const BreadcrumbLabel = forwardRef<
  HTMLSpanElement,
  BreadcrumbLabelProps
>(function BreadcrumbLabel({ className, ...rest }, ref) {
  return (
    <span
      ref={ref}
      className={clsx(withBaseName("label"), className)}
      {...rest}
    />
  );
});
