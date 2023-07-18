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

}

export function useTooltip(props?: UseTooltipProps) {
  const {
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
    // useHover(context, {
    //   enabled: !disableHoverListener,
    //   handleClose: safePolygon(),
    // }),
    useFocus(context, { enabled: !disableFocusListener }),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ]);


  const getTooltipProps = (): HTMLProps<HTMLDivElement> => {
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
    floating,
    reference,
    getTooltipProps,
    getTriggerProps,
  };
}
