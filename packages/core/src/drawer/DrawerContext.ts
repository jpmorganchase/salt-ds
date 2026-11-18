import { useContext } from "react";
import { createContext } from "../utils";
import type { DrawerProps } from "./Drawer";

export interface DrawerContextValue {
  drawerId?: string;
  position?: DrawerProps["position"];
  resizable?: boolean;
  headerId?: string;
  setHeaderId?: (id: string | undefined) => void;
  descriptionId?: string;
  setDescriptionId?: (id: string | undefined) => void;
}

export const DrawerContext = createContext<DrawerContextValue>(
  "DrawerContext",
  {
    drawerId: undefined,
    position: undefined,
    resizable: false,
    headerId: undefined,
    setHeaderId: () => {},
    descriptionId: undefined,
    setDescriptionId: () => {},
  },
);

export const useDrawerContext = () => {
  return useContext(DrawerContext);
};
