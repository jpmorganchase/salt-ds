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
} from "@floating-ui/react";
import { useControlled } from "../utils";
import { HTMLProps, useRef } from "react";
import { useAriaAnnounce } from "./useAriaAnnounce";
import { UseFloatingUIProps, useFloatingUI } from "../popper";

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
  /**
   * to be removed
   */
  disabled?: boolean;
}

export function useTooltip(props?: UseTooltipProps) {
  const {
    enterDelay = 100,
    leaveDelay = 0,
    open: openProp,
    onOpenChange,
    placement: placementProp,
    disableHoverListener,
    disableFocusListener,
  } = props || {};

  const arrowRef = useRef<HTMLDivElement | null>(null);

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

  const middleware = [offset(8), flip(), shift(), arrow({ element: arrowRef })];
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
    middleware,
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
    style: {
      left: arrowX ? `${arrowX}px` : "",
      top: arrowY ? `${arrowY}px` : "",
    },
  };

  const getTooltipProps = (): HTMLProps<HTMLElement> => {
    return getFloatingProps({
      // @ts-ignore
      "data-placement": placement,
      ref: floating,
      style: {
        top: y ?? "",
        left: x ?? "",
        position: strategy,
      },
    });
  };

  const getTriggerProps = () =>
    getReferenceProps({
      ref: reference,
    });

  return {
    arrowProps,
    open,
    getTooltipProps,
    getTriggerProps,
  };
}
