import { useFloatingRootContext } from "@floating-ui/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useControlled } from "../utils";
import { SidePanelContext, useSidePanelTabOrder } from "./internal";

export interface SidePanelProviderProps {
  /**
   * If `true`, the panel is open. Use with `onOpenChange` to control it.
   */
  open?: boolean;
  /**
   * If `true`, the panel is open initially. Use when the component is uncontrolled.
   */
  defaultOpen?: boolean;
  /**
   * Callback fired when the open state changes.
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
  const [titleId, setTitleId] = useState<string | undefined>(undefined);

  // Memoise so floating-ui's root context isn't recreated every render.
  const elements = useMemo(
    () => ({ reference, floating }),
    [reference, floating],
  );

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: handleOpenChange,
    elements,
  });

  useEffect(() => {
    if (!openState || !floating) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      handleOpenChange(false);
    };

    floating.addEventListener("keydown", onKeyDown);
    return () => {
      floating.removeEventListener("keydown", onKeyDown);
    };
  }, [floating, openState, handleOpenChange]);

  useSidePanelTabOrder({
    floating,
    open: openState,
    reference,
  });

  const context = useMemo(
    () => ({
      openState,
      floatingRootContext,
      setFloating,
      setReference,
      setOpen: handleOpenChange,
      panelId,
      setPanelId,
      titleId,
      setTitleId,
    }),
    [openState, floatingRootContext, handleOpenChange, panelId, titleId],
  );

  return (
    <SidePanelContext.Provider value={context}>
      {children}
    </SidePanelContext.Provider>
  );
}
