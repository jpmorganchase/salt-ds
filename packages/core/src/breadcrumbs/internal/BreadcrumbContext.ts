import { createContext, type Ref, useContext } from "react";
import type { RenderPropsType } from "../../utils";

export type BreadcrumbPlacement = "disclosure" | "trail";

export interface BreadcrumbContextValue {
  current: boolean;
  href?: string;
  onNavigate?: () => void;
  placement: BreadcrumbPlacement;
  render?: RenderPropsType["render"];
  showSeparator: boolean;
  triggerRef?: Ref<HTMLAnchorElement>;
}

export const BreadcrumbContext = createContext<
  BreadcrumbContextValue | undefined
>(undefined);

export function useBreadcrumbContext() {
  return useContext(BreadcrumbContext);
}
