import { createContext } from "@salt-ds/core";
import { type MutableRefObject, useContext } from "react";

export interface InlaidPanelContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelId?: string;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
}

const InlaidPanelContext = createContext<InlaidPanelContextValue>(
  "InlaidPanelContext",
  {
    open: false,
    onOpenChange: () => undefined,
    triggerRef: { current: null },
  },
);

export { InlaidPanelContext };

export function useInlaidPanel(): InlaidPanelContextValue {
  return useContext(InlaidPanelContext);
}
