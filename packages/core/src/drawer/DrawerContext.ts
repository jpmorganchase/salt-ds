import { useContext } from "react";
import { createContext } from "../utils";

export interface DrawerContextValue {
  drawerId?: string;
  headerId?: string;
  setHeaderId?: (id: string | undefined) => void;
  hasHeader?: boolean;
  setHasHeader?: (hasHeader: boolean) => void;
  hasContent?: boolean;
  setHasContent?: (hasContent: boolean) => void;
  descriptionId?: string;
  setDescriptionId?: (id: string | undefined) => void;
}

export const DrawerContext = createContext<DrawerContextValue>(
  "DrawerContext",
  {
    drawerId: undefined,
    headerId: undefined,
    setHeaderId: () => {},
    hasHeader: false,
    setHasHeader: () => {},
    hasContent: false,
    setHasContent: () => {},
    descriptionId: undefined,
    setDescriptionId: () => {},
  },
);

export const useDrawerContext = () => {
  return useContext(DrawerContext);
};
