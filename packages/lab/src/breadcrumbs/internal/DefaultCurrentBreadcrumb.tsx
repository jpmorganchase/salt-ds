import { forwardRef, HTMLAttributes } from "react";
import { Div } from "@jpmorganchase/uitk-lab";

export interface DefaultCurrentBreadcrumbProps
  extends HTMLAttributes<HTMLDivElement> {}

export const DefaultCurrentBreadcrumb = forwardRef<
  HTMLDivElement,
  DefaultCurrentBreadcrumbProps
>(function DefaultCurrentBreadcrumb(props, ref) {
  return <Div truncate maxRows={1} aria-current="page" {...props} ref={ref} />;
});
