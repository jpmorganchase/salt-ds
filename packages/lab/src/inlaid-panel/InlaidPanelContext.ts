import { createContext } from "@salt-ds/core";
import { type MutableRefObject, useContext } from "react";

export interface InlaidPanelContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelId?: string;
  lastTriggerRef: MutableRefObject<HTMLButtonElement | null>;
  setLastTrigger: (trigger: HTMLButtonElement | null) => void;
}

const InlaidPanelContext = createContext<InlaidPanelContextValue>(
  "InlaidPanelContext",
  {
    open: false,
    onOpenChange: () => undefined,
    lastTriggerRef: { current: null },
    setLastTrigger: () => undefined,
  },
);

export { InlaidPanelContext };

export function useInlaidPanel(): InlaidPanelContextValue {
  return useContext(InlaidPanelContext);
}
