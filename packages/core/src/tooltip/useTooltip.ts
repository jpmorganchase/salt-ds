import {
  arrow,
  flip,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  limitShift,
} from "@floating-ui/react";
import { HTMLProps, useRef } from "react";
import { useControlled, UseFloatingUIProps, useFloatingUI } from "../utils";
import { useAriaAnnounce } from "./useAriaAnnounce";

export interface UseTooltipProps
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
  /**
   * The number of milliseconds to wait before showing the tooltip.
   * This prop won't impact the enter touch delay (`enterTouchDelay`).
   */
  enterDelay?: number;
  /**
   * The number of milliseconds to wait before hiding the tooltip.
   * This prop won't impact the leave touch delay (`leaveTouchDelay`).
   */
  leaveDelay?: number;
}

export function useTooltip(props?: UseTooltipProps) {
  const {
    enterDelay,
    leaveDelay,
    open: openProp,
    onOpenChange,
    placement: placementProp,
    disableHoverListener,
    disableFocusListener,
  } = props || {};

  const arrowRef = useRef<SVGSVGElement | null>(null);

  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: false,
    name: "Tooltip",
    state: "open",
  });
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
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
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
    useHover(context, {
      delay: {
        open: enterDelay,
        close: leaveDelay,
      },
      enabled: !disableHoverListener,
      handleClose: safePolygon(),
    }),
    useFocus(context, { enabled: !disableFocusListener }),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
    useAriaAnnounce(context, {
      delay: {
        open: enterDelay,
        close: leaveDelay,
      },
    }),
  ]);

  const arrowProps = {
    ref: arrowRef,
    context,
    style: {
      position: strategy,
      left: arrowX ?? 0,
      top: arrowY ?? 0,
    },
  };

  const getTooltipProps = (): HTMLProps<HTMLDivElement> => {
    return getFloatingProps({
      // @ts-ignore
      "data-placement": placement,
      ref: floating,
    });
  };

  const getTriggerProps = () =>
    getReferenceProps({
      ref: reference,
    });

  const getTooltipPosition = () => ({
    top: y ?? 0,
    left: x ?? 0,
    position: strategy,
  });

  return {
    arrowProps,
    open,
    floating,
    reference,
    getTooltipProps,
    getTriggerProps,
    getTooltipPosition,
  };
}
