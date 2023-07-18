import {
  arrow,
  flip,
  limitShift,
  offset,
  shift,
  useDismiss,
  useFocus,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import {HTMLProps, useRef, useState} from "react";
import {useFloatingUI, UseFloatingUIProps} from "../utils";
import {useControlled} from "@salt-ds/core";

export interface UsePortalProps
  extends Partial<
    Pick<UseFloatingUIProps, "onOpenChange" | "open" | "placement">
    > {
  /**
   * Do not respond to focus events.
   */
  disableFocusListener?: boolean;
  /**
   * Do not respond to hover events.
   */
  disableHoverListener?: boolean;

}

export function usePortal(props?: UsePortalProps) {
  const {
    open: openProp,
    onOpenChange,
    placement: placementProp,
    disableHoverListener,
    disableFocusListener,
  } = props || {};
  const [open, setOpen] = useState(false)

  const arrowRef = useRef<SVGSVGElement | null>(null);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    onOpenChange?.(open);
  };

  const {
    floating,
    reference,
    x,
    y,
    strategy,
    placement,
    context,
  } = useFloatingUI({
    open,
    onOpenChange: handleOpenChange,
    placement: placementProp,
    middleware: [
      offset(8),
      flip(),
      shift({ limiter: limitShift() }),
      arrow({ element: arrowRef }),
    ],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    // useHover(context, {
    //   enabled: !disableHoverListener,
    //   handleClose: safePolygon(),
    // }),
    useFocus(context, { enabled: !disableFocusListener }),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ]);


  const getPortalProps = (): HTMLProps<HTMLDivElement> => {
    return getFloatingProps({
      // @ts-ignore
      "data-placement": placement,
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
