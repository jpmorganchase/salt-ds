import { useId } from "@salt-ds/core";
import { type MutableRefObject, type ReactNode, useRef } from "react";
import { InlaidPanelContext } from "./InlaidPanelContext";

export interface InlaidPanelGroupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function InlaidPanelGroup({
  open,
  onOpenChange,
  children,
}: InlaidPanelGroupProps) {
  const panelId = useId();

  const triggerRef: MutableRefObject<HTMLButtonElement | null> =
    useRef<HTMLButtonElement | null>(null);

  return (
    <InlaidPanelContext.Provider
      value={{ open, onOpenChange, panelId, triggerRef }}
    >
      {children}
    </InlaidPanelContext.Provider>
  );
}
