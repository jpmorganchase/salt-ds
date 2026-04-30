import { useFloatingRootContext, useInteractions } from "@floating-ui/react";
import { useControlled } from "@salt-ds/core";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SidePanelContext } from "./internal";

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
  const { children, open: openProp, defaultOpen, onOpenChange } = props;

  const [openState, setOpenState] = useControlled({
    default: Boolean(defaultOpen),
    controlled: openProp,
    name: "SidePanelProvider",
    state: "open",
  });

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const [reference, setReference] = useState<HTMLElement | null>(null);
  const [floating, setFloating] = useState<HTMLDivElement | null>(null);
  const [panelId, setPanelId] = useState<string | undefined>(undefined);
  const [headerId, setHeaderId] = useState<string | undefined>(undefined);

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: handleOpenChange,
    elements: {
      reference,
      floating,
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions();

  useEffect(() => {
    if (!openState) {
      return;
    }

    const targetDocument = floating?.ownerDocument ?? reference?.ownerDocument;
    if (!targetDocument) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const activeElement = targetDocument.activeElement;
      const focusOwnedByPanel =
        activeElement != null &&
        (floating?.contains(activeElement) ||
          reference?.contains(activeElement));

      if (!focusOwnedByPanel) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      handleOpenChange(false);
    };

    targetDocument.addEventListener("keydown", onKeyDown);
    return () => {
      targetDocument.removeEventListener("keydown", onKeyDown);
    };
  }, [floating, reference, openState, handleOpenChange]);

  const context = useMemo(
    () => ({
      openState,
      floatingRootContext,
      getFloatingProps,
      getReferenceProps,
      setFloating,
      setReference,
      setOpen: handleOpenChange,
      panelId,
      setPanelId,
      headerId,
      setHeaderId,
    }),
    [
      openState,
      floatingRootContext,
      getFloatingProps,
      getReferenceProps,
      handleOpenChange,
      panelId,
      headerId,
    ],
  );

  return (
    <SidePanelContext.Provider value={context}>
      {children}
    </SidePanelContext.Provider>
  );
}
