import { useContext } from "react";
import { createContext } from "../utils";

export interface DrawerContextValue {
  id?: string;
  setId?: (id: string) => void;
}

export const DrawerContext = createContext<DrawerContextValue>(
  "DrawerContext",
  {
    id: undefined,
    setId: () => {},
  },
);

export const useDrawerContext = () => {
  return useContext(DrawerContext);
};
