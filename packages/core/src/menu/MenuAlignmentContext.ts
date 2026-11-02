import { useCallback, useContext, useMemo, useState } from "react";
import { createContext } from "../utils";

/**
 * The leading slots that items in one alignment scope reserve for each other.
 * Each `MenuGroup` is a scope, and items outside a group share their `MenuPanel`'s scope.
 */
export interface MenuAlignmentContextValue {
  reserveIconSpace: boolean;
  reserveSelectionIconSpace: boolean;
  registerIcon: () => () => void;
  registerSelectionIcon: () => () => void;
}

export const MenuAlignmentContext = createContext<MenuAlignmentContextValue>(
  "MenuAlignmentContext",
  {
    reserveIconSpace: false,
    reserveSelectionIconSpace: false,
    registerIcon: () => () => undefined,
    registerSelectionIcon: () => () => undefined,
  },
);

export function useSlotRegistry() {
  const [count, setCount] = useState(0);
  const register = useCallback(() => {
    setCount((current) => current + 1);
    return () => setCount((current) => current - 1);
  }, []);
  return [count > 0, register] as const;
}

export function useMenuAlignmentScope(): MenuAlignmentContextValue {
  const [reserveIconSpace, registerIcon] = useSlotRegistry();
  const [reserveSelectionIconSpace, registerSelectionIcon] = useSlotRegistry();
  return useMemo(
    () => ({
      reserveIconSpace,
      reserveSelectionIconSpace,
      registerIcon,
      registerSelectionIcon,
    }),
    [
      reserveIconSpace,
      reserveSelectionIconSpace,
      registerIcon,
      registerSelectionIcon,
    ],
  );
}

export function useMenuAlignment() {
  return useContext(MenuAlignmentContext);
}
