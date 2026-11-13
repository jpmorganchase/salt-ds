import { createContext } from "@salt-ds/core";

export const MAIN_CONTENT_ID = "salt-main-content";

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
