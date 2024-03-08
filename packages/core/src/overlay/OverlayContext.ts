import {
  FloatingArrowProps,
  FloatingContext,
  Placement,
  ReferenceType,
  Strategy,
} from "@floating-ui/react";
import { createContext, useFloatingUI } from "../utils";
import { SyntheticEvent, useContext } from "react";

type FloatingReturn = ReturnType<typeof useFloatingUI>;
type FloatingStyleProps = {
  top: number;
  left: number;
  position: Strategy;
  width?: number;
  height?: number;
};

export interface OverlayContextValue {
  id: string;
  openState: boolean;
  setOpen: (event: SyntheticEvent, newOpen: boolean) => void;
  floatingStyles: FloatingStyleProps;
  placement: Placement;
  arrowProps: FloatingArrowProps;
  context: FloatingContext;
  reference?: (node: ReferenceType | null) => void;
  floating?: (node: HTMLElement | null) => void;
  handleCloseButton: (event: SyntheticEvent) => void;
  getFloatingProps: (
    userProps?: React.HTMLProps<HTMLElement> | undefined
  ) => Record<string, unknown>;
  getReferenceProps: (
    userProps?: React.HTMLProps<Element> | undefined
  ) => Record<string, unknown>;
}

export const OverlayContext = createContext<OverlayContextValue>(
  "OverlayContext",
  {
    id: "",
    openState: false,
    setOpen() {
      return undefined;
    },
    floatingStyles: {
      top: 0,
      left: 0,
      position: "" as Strategy,
    },
    placement: "" as Placement,
    context: {} as FloatingContext,
    arrowProps: {} as FloatingArrowProps,
    handleCloseButton() {
      return undefined;
    },
    reference: {} as FloatingReturn["reference"],
    floating: {} as FloatingReturn["floating"],
    getFloatingProps() {
      return {} as Record<string, unknown>;
    },
    getReferenceProps() {
      return {} as Record<string, unknown>;
    },
  }
);

export function useOverlayContext() {
  return useContext(OverlayContext);
}
