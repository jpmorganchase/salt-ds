import {
  useClick,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { type ComponentPropsWithoutRef, useState } from "react";
import { useControlled } from "../utils";
import { ToggletipContext } from "./ToggletipContext";

export interface ToggletipProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Display or hide the component.
   */
  open?: boolean;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /*
   * Set the placement of the Toggletip component relative to the trigger element. Defaults to `top`.
   */
  placement?: "top" | "bottom" | "left" | "right";
}

export const Toggletip = ({
  children,
  open,
  onOpenChange,
  placement = "top",
}: ToggletipProps) => {
  const [openState, setOpenState] = useControlled({
    controlled: open,
    default: false,
    name: "Toggletip",
    state: "open",
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpenState(newOpen);
    onOpenChange?.(newOpen);
  };

  const [reference, setReference] = useState<HTMLButtonElement | null>(null);
  const [floating, setFloating] = useState<HTMLDivElement | null>(null);

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: handleOpenChange,
    elements: {
      reference,
      floating,
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useRole(floatingRootContext, { role: "dialog" }),
    useClick(floatingRootContext),
    useDismiss(floatingRootContext),
  ]);

  return (
    <ToggletipContext.Provider
      value={{
        openState,
        floatingRootContext,
        placement,
        getFloatingProps,
        getReferenceProps,
        setFloating,
        setReference,
      }}
    >
      {children}
    </ToggletipContext.Provider>
  );
};
