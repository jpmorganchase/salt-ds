import type { LinkProps } from "@salt-ds/core";
import { createContext, type ReactNode, type Ref, useContext } from "react";

export interface BreadcrumbNextContextValue {
  current: boolean;
  href?: string;
  render?: LinkProps["render"];
  label?: ReactNode;
  showSeparator: boolean;
  triggerRef?: Ref<HTMLAnchorElement | HTMLSpanElement>;
}

export const BreadcrumbNextContext = createContext<
  BreadcrumbNextContextValue | undefined
>(undefined);

export function useBreadcrumbNextContext() {
  return useContext(BreadcrumbNextContext);
}
