import type { RenderPropsType } from "@salt-ds/core";
import { createContext, type Ref, useContext } from "react";

export type BreadcrumbNextPlacement = "disclosure" | "trail";

export interface BreadcrumbNextContextValue {
  current: boolean;
  href?: string;
  onNavigate?: () => void;
  placement: BreadcrumbNextPlacement;
  render?: RenderPropsType["render"];
  showSeparator: boolean;
  triggerRef?: Ref<HTMLAnchorElement | HTMLSpanElement>;
}

export const BreadcrumbNextContext = createContext<
  BreadcrumbNextContextValue | undefined
>(undefined);

export function useBreadcrumbNextContext() {
  return useContext(BreadcrumbNextContext);
}
