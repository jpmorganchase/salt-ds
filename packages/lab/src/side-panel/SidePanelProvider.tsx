import { useControlled, useId } from "@salt-ds/core";
import {
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { SidePanelContext } from "./SidePanelContext";

export interface SidePanelProviderProps {
  /**
   * Whether the panel is open.
   */
  open?: boolean;
  /**
   * Default open state when initially rendered.
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * SidePanelProvider children, should include SidePanel and SidePanelTrigger.
   */
  children: ReactNode;
}

export function SidePanelProvider(props: SidePanelProviderProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const [activationCount, setActivationCount] = useState(0);

  const { children, open: openProp, defaultOpen, onOpenChange } = props;

  const [open, setOpenState] = useControlled({
    default: Boolean(defaultOpen),
    controlled: openProp,
    name: "SidePanelProvider",
    state: "open",
  });

  const panelId = useId();

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (newOpen === open) {
        return;
      }

      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [open, onOpenChange, setOpenState],
  );

  const activateTrigger = useCallback(
    (triggerElement: MutableRefObject<HTMLElement | null>) => {
      triggerRef.current = triggerElement.current;
      setActivationCount((count) => count + 1);
      setOpen(true);
    },
    [setOpen],
  );

  // Convenience methods for building custom triggers without SidePanelTrigger.
  // They return the same ARIA attributes that SidePanelTrigger sets internally.
  const getFloatingProps = useCallback(() => ({ id: panelId }), [panelId]);

  const getReferenceProps = useCallback(
    (extraProps: Record<string, unknown> = {}) => ({
      ...extraProps,
      "aria-expanded": open,
      "aria-controls": panelId,
    }),
    [open, panelId],
  );

  const setReference = useCallback((el: HTMLElement | null) => {
    triggerRef.current = el;
  }, []);

  const contextValue = useMemo(
    () => ({
      openState: open,
      setOpen,
      panelId,
      triggerRef,
      activateTrigger,
      activationCount,
      getFloatingProps,
      getReferenceProps,
      setReference,
    }),
    [
      open,
      setOpen,
      panelId,
      activateTrigger,
      activationCount,
      getFloatingProps,
      getReferenceProps,
      setReference,
    ],
  );

  return (
    <SidePanelContext.Provider value={contextValue}>
      {children}
    </SidePanelContext.Provider>
  );
}
