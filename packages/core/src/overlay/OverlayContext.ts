import type {
  FloatingArrowProps,
  FloatingContext,
  ReferenceType,
  Strategy,
} from "@floating-ui/react";
import { type HTMLProps, useContext } from "react";
import { createContext, type useFloatingUI } from "../utils";

type FloatingReturn = ReturnType<typeof useFloatingUI>;
type FloatingStyleProps = {
  top: number;
  left: number;
  position: Strategy;
  width?: number;
  height?: number;
};

export interface OverlayContextValue {
  openState: boolean;
  floatingStyles: FloatingStyleProps;
  arrowProps: FloatingArrowProps;
  context: FloatingContext;
  reference?: (node: ReferenceType | null) => void;
  floating?: (node: HTMLElement | null) => void;
  getFloatingProps: (
    userProps?: HTMLProps<HTMLElement> | undefined,
  ) => Record<string, unknown>;
  getReferenceProps: (
    userProps?: HTMLProps<Element> | undefined,
  ) => Record<string, unknown>;
}

export const OverlayContext = createContext<OverlayContextValue>(
  "OverlayContext",
  {
    openState: false,
    floatingStyles: {
      top: 0,
      left: 0,
      position: "" as Strategy,
    },
    context: {} as FloatingContext,
    arrowProps: {} as FloatingArrowProps,
    reference: {} as FloatingReturn["reference"],
    floating: {} as FloatingReturn["floating"],
    getFloatingProps() {
      return {} as Record<string, unknown>;
    },
    getReferenceProps() {
      return {} as Record<string, unknown>;
    },
  },
);

export function useOverlayContext() {
  return useContext(OverlayContext);
}
