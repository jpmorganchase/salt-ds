import {
  flip,
  limitShift,
  offset,
  Placement,
  shift,
  size,
  useDismiss,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { HTMLProps, useState } from "react";
import { useFloatingUI } from "@salt-ds/core";

export interface UseComboBoxPortalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
}

export function useComboboxPortal(props?: UseComboBoxPortalProps) {
  const {
    open: openProp = false,
    onOpenChange: onOpenChangeProp,
    placement: placementProp = "bottom",
  } = props || {};
  const [open, setOpen] = useState<boolean>(openProp);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    onOpenChangeProp?.(open);
  };

  const { floating, reference, x, y, strategy, context } = useFloatingUI({
    open,
    onOpenChange: onOpenChange,
    placement: placementProp,
    middleware: [
      offset(0),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
      flip(),
      shift({ limiter: limitShift() }),
    ],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useRole(context, { role: "listbox" }),
    useDismiss(context),
  ]);

  const getPortalProps = (): HTMLProps<HTMLDivElement> => {
    return getFloatingProps({
      ref: floating,
      style: {
        top: y ?? 0,
        left: x ?? 0,
        position: strategy,
      },
    });
  };

  const getTriggerProps = () =>
    getReferenceProps({
      ref: reference,
    });

  return {
    open,
    setOpen,
    floating,
    reference,
    getPortalProps,
    getTriggerProps,
  };
}
