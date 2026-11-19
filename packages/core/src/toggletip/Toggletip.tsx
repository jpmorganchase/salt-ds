import {
  useClick,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { type ReactNode, useState } from "react";
import { useControlled } from "../utils";
import { ToggletipContext } from "./ToggletipContext";

export interface ToggletipProps {
  children?: ReactNode;
  /**
   * If `true`, the Toggletip is open. Use with `onOpenChange` to control it.
   */
  open?: boolean;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The placement of the Toggletip relative to its trigger.
   * @default "top"
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
  const [floatingContent, setFloatingContent] = useState<HTMLDivElement | null>(
    null,
  );
  const [triggerId, setTriggerId] = useState<string | undefined>(undefined);

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
        floatingContent,
        getFloatingProps,
        getReferenceProps,
        setFloating,
        setFloatingContent,
        setReference,
        setTriggerId,
        triggerId,
      }}
    >
      {children}
    </ToggletipContext.Provider>
  );
};
