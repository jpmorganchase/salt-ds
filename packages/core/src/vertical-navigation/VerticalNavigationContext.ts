import { type SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";

export type VerticalNavigationContextValue = {
  /**
   * Whether the navigation is collapsed to an icon rail.
   */
  collapsed: boolean;
  /**
   * Collapses or expands the navigation.
   */
  setCollapsed: (event: SyntheticEvent, collapsed: boolean) => void;
  /**
   * Id of the nav element, used by the collapse trigger for `aria-controls`.
   */
  navId?: string;
};

export const VerticalNavigationContext =
  createContext<VerticalNavigationContextValue>("VerticalNavigationContext", {
    collapsed: false,
    setCollapsed: () => {},
  });

export function useVerticalNavigationContext() {
  return useContext(VerticalNavigationContext);
}
