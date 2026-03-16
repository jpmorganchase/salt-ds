import { useId } from "@salt-ds/core";
import {
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useRef,
} from "react";
import { InlaidPanelContext } from "./InlaidPanelContext";

export interface InlaidPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function InlaidPanel({
  open,
  onOpenChange,
  children,
}: InlaidPanelProps) {
  const panelId = useId();

  const lastTriggerRef: MutableRefObject<HTMLButtonElement | null> =
    useRef<HTMLButtonElement | null>(null);

  const setLastTrigger = useCallback((trigger: HTMLButtonElement | null) => {
    lastTriggerRef.current = trigger;
  }, []);

  return (
    <InlaidPanelContext.Provider
      value={{ open, onOpenChange, panelId, lastTriggerRef, setLastTrigger }}
    >
      {children}
    </InlaidPanelContext.Provider>
  );
}
