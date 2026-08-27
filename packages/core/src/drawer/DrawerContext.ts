import { useContext } from "react";
import { createContext } from "../utils";

export interface DrawerContextValue {
  headerId?: string;
  setHeaderId?: (id: string | undefined) => void;
  hasHeader?: boolean;
  setHasHeader?: (hasHeader: boolean) => void;
}

export const DrawerContext = createContext<DrawerContextValue>(
  "DrawerContext",
  {
    headerId: undefined,
    setHeaderId: () => {},
    hasHeader: false,
    setHasHeader: () => {},
  },
);

export const useDrawerContext = () => {
  return useContext(DrawerContext);
};
