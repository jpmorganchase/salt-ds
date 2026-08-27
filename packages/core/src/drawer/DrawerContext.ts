import { useContext } from "react";
import { createContext } from "../utils";

export interface DrawerContextValue {
  headerId?: string;
  setHeaderId?: (id: string | undefined) => void;
}

export const DrawerContext = createContext<DrawerContextValue>(
  "DrawerContext",
  {
    headerId: undefined,
    setHeaderId: () => {},
  },
);

export const useDrawerContext = () => {
  return useContext(DrawerContext);
};
