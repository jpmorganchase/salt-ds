import { useContext } from "react";
import { MegaMenuContext, type MegaMenuContextValue } from "./MegaMenuContext";
/**
 * Access the nearest MegaMenu context.
 * Must be used within a `MegaMenu` provider.
 */
export function useMegaMenu(): MegaMenuContextValue {
  const context = useContext(MegaMenuContext);
  if (context === undefined) {
    throw new Error("useMegaMenu must be used within a MegaMenu");
  }
  return context;
}
