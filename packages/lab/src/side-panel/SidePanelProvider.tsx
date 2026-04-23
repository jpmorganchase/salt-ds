import {
  useDismiss,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";
import { useControlled } from "@salt-ds/core";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { SidePanelContext } from "./SidePanelContext";

export interface SidePanelGroupProps {
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

export function SidePanelProvider(props: SidePanelGroupProps) {
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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [panelHeaderId, setPanelHeaderId] = useState<string | undefined>(
    undefined,
  );
  const [panelId, setPanelId] = useState<string | undefined>(undefined);

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: handleOpenChange,
    elements: {
      reference,
      floating,
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(floatingRootContext, {
      // Escape is handled below so only the currently focused panel (or trigger)
      // can close, preventing unrelated open panels from dismissing.
      escapeKey: false,
      outsidePress: false,
      bubbles: false,
    }),
  ]);

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

  return (
    <SidePanelContext.Provider
      value={{
        openState,
        floatingRootContext,
        getFloatingProps,
        getReferenceProps,
        setFloating,
        setReference,
        setOpen: handleOpenChange,
        closeButtonRef,
        panelHeaderId,
        setPanelHeaderId,
        panelId,
        setPanelId,
      }}
    >
      {children}
    </SidePanelContext.Provider>
  );
}
