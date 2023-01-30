import {
  arrow,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { margin, useControlled } from "packages/core/src/index";
import { HTMLProps, useMemo, useRef } from "react";
import { UseFloatingUIProps } from "@salt-ds/lab/src/popper";
import { isDesktop } from "@salt-ds/lab/src/window";
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
    placement: placementProp = "right",
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

  const middleware = isDesktop
    ? [margin(8), arrow({ element: arrowRef })]
    : [offset(8), flip(), shift(), arrow({ element: arrowRef })];
  const {
    floating,
    reference,
    x,
    y,
    strategy,
    middlewareData,
    placement,
    context,
  } = useFloating({
    open,
    onOpenChange: handleOpenChange,
    placement: placementProp,
    middleware,
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      delay: {
        open: enterDelay,
        close: leaveDelay,
      },
      enabled: !disableHoverListener,
      handleClose: isDesktop ? null : safePolygon(),
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
      left: middlewareData.arrow?.x ?? "",
      top: middlewareData.arrow?.y ?? "",
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

  return useMemo(
    () => ({
      arrowProps,
      open,
      getTooltipProps,
      getTriggerProps,
    }),
    [arrowProps, open, getTooltipProps, getTriggerProps]
  );
}
