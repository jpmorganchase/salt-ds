import type { FloatingRootContext, Placement } from "@floating-ui/react";
import {
  type Dispatch,
  type HTMLProps,
  type SetStateAction,
  useContext,
} from "react";
import { createContext } from "../utils";

export interface ToggletipContextValue {
  openState: boolean;
  floatingRootContext: FloatingRootContext;
  placement: Placement;
  floatingContent: HTMLDivElement | null;
  getFloatingProps: (
    userProps?: HTMLProps<HTMLElement> | undefined,
  ) => Record<string, unknown>;
  getReferenceProps: (
    userProps?: HTMLProps<Element> | undefined,
  ) => Record<string, unknown>;
  setFloating: Dispatch<SetStateAction<HTMLDivElement | null>>;
  setFloatingContent: Dispatch<SetStateAction<HTMLDivElement | null>>;
  setReference: Dispatch<SetStateAction<HTMLButtonElement | null>>;
  setTriggerId: Dispatch<SetStateAction<string | undefined>>;
  triggerId: string | undefined;
}

export const ToggletipContext = createContext<ToggletipContextValue>(
  "ToggletipContext",
  {
    openState: false,
    floatingRootContext: {} as FloatingRootContext,
    placement: "top",
    floatingContent: null,
    getFloatingProps() {
      return {} as Record<string, unknown>;
    },
    getReferenceProps() {
      return {} as Record<string, unknown>;
    },
    setFloating: () => {},
    setFloatingContent: () => {},
    setReference: () => {},
    setTriggerId: () => {},
    triggerId: undefined,
  },
);

export function useToggletipContext() {
  return useContext(ToggletipContext);
}
