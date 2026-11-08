import { createContext } from "@salt-ds/core";

interface LayoutContextValue {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  mainId?: string;
  setMainId?: (id: string | undefined) => void;
}

export const LayoutContext = createContext<LayoutContextValue>(
  "LayoutContext",
  {
    drawerOpen: false,
    setDrawerOpen: () => {},
  },
);
