import {
  arrow,
  flip,
  limitShift,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { type HTMLProps, useRef } from "react";
import {
  type UseFloatingUIProps,
  useControlled,
  useFloatingUI,
} from "../utils";
import { useAriaAnnounce } from "./useAriaAnnounce";

export interface UseTooltipProps
  extends Partial<
    Pick<UseFloatingUIProps, "onOpenChange" | "open" | "placement">
  > {
  /**
   * When `true`, the tooltip will be disabled.
   */
  disabled?: boolean;
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
    disabled,
    leaveDelay,
    open: openProp,
    onOpenChange,
    placement: placementProp,
    disableHoverListener,
    disableFocusListener,
  } = props ?? {};

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

  const { floating, reference, x, y, strategy, placement, context, elements } =
    useFloatingUI({
      open: disabled ? false : open,
      onOpenChange: handleOpenChange,
      placement: placementProp,
      middleware: [
        offset(8),
        shift({ limiter: limitShift() }),
        flip({
          fallbackAxisSideDirection: "end",
          fallbackStrategy: "initialPlacement",
        }),
        arrow({ element: arrowRef }),
      ],
    });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      delay: {
        open: enterDelay,
        close: leaveDelay,
      },
      enabled: !(disableHoverListener || disabled),
      handleClose: safePolygon(),
    }),
    useFocus(context, { enabled: !(disableFocusListener || disabled) }),
    useRole(context, { role: "tooltip" }),
    useDismiss(context, { enabled: !disabled }),
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
  };

  const getTooltipProps = (): HTMLProps<HTMLDivElement> => {
    // tabIndex causes axe errors because it is set to "-1".
    const { tabIndex: _tabIndex, ...tooltipProps } = getFloatingProps({
      // @ts-expect-error - `data-*` props need extra typing when not used on a DOM element.
      "data-placement": placement,
      ref: floating,
    });

    return tooltipProps;
  };

  const getTriggerProps = () =>
    getReferenceProps({
      ref: reference,
    });

  const getTooltipPosition = () => ({
    top: y ?? 0,
    left: x ?? 0,
    position: strategy,
    width: elements.floating?.offsetWidth,
    height: elements.floating?.offsetHeight,
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
