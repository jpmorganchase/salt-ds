import {
  FloatingArrowProps,
  FloatingContext,
  Placement,
  ReferenceType,
} from "@floating-ui/react";
import { createContext, useFloatingUI } from "@salt-ds/core";
import { CSSProperties, SyntheticEvent, useContext } from "react";

type FloatingReturn = ReturnType<typeof useFloatingUI>;

export interface OverlayContextValue {
  id: string;
  openState: boolean;
  setOpen: (event: SyntheticEvent, newOpen: boolean) => void;
  floatingStyles: CSSProperties;
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
    floatingStyles: {},
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
