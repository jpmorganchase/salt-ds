import React, { forwardRef, HTMLAttributes } from "react";

export interface DefaultCurrentBreadcrumbProps
  extends HTMLAttributes<HTMLDivElement> {}

export const DefaultCurrentBreadcrumb = forwardRef<
  HTMLDivElement,
  DefaultCurrentBreadcrumbProps
>(function DefaultCurrentBreadcrumb(props, ref) {
  return <div aria-current="page" {...props} ref={ref} />;
});
