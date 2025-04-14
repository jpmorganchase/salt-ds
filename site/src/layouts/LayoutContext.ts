import { createContext } from "@salt-ds/core";

interface LayoutContextValue {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextValue>(
  "LayoutContext",
  {
    drawerOpen: false,
    setDrawerOpen: () => {},
  },
);
