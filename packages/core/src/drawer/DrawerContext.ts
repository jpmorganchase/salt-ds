import { useContext } from "react";
import { createContext } from "../utils";

export interface DrawerContextValue {
  drawerId?: string;
  headerId?: string;
  setHeaderId?: (id: string | undefined) => void;
  descriptionId?: string;
  setDescriptionId?: (id: string | undefined) => void;
}

export const DrawerContext = createContext<DrawerContextValue>(
  "DrawerContext",
  {
    drawerId: undefined,
    headerId: undefined,
    setHeaderId: () => {},
    descriptionId: undefined,
    setDescriptionId: () => {},
  },
);

export const useDrawerContext = () => {
  return useContext(DrawerContext);
};
