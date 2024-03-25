import {
  FloatingArrowProps,
  FloatingContext,
  Placement,
  ReferenceType,
  Strategy,
} from "@floating-ui/react";
import { createContext, useFloatingUI } from "@salt-ds/core";
import { useContext } from "react";

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
  floatingStyles: FloatingStyleProps;
  placement: Placement;
  arrowProps: FloatingArrowProps;
  context: FloatingContext;
  reference?: (node: ReferenceType | null) => void;
  floating?: (node: HTMLElement | null) => void;
  handleCloseButtonClick: () => void;
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
    floatingStyles: {
      top: 0,
      left: 0,
      position: "" as Strategy,
    },
    placement: "" as Placement,
    context: {} as FloatingContext,
    arrowProps: {} as FloatingArrowProps,
    handleCloseButtonClick() {
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
