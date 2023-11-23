import {
  arrow,
  flip,
  limitShift,
  offset,
  shift,
  useDismiss,
  useClick,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import {
  useControlled,
  useFloatingUI,
  UseFloatingUIProps,
} from "@salt-ds/core";
import { HTMLProps, useRef } from "react";

export interface UseOverlayProps
  extends Partial<
    Pick<UseFloatingUIProps, "onOpenChange" | "open" | "placement">
  > {}

export function useOverlay(props?: UseOverlayProps) {
  const {
    open: openProp,
    placement: placementProp,
    onOpenChange: onOpenChangeProp,
  } = props || {};

  const arrowRef = useRef<SVGSVGElement | null>(null);

  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: false,
    name: "Overlay",
    state: "open",
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChangeProp?.(newOpen);
  };

  const {
    reference,
    floating,
    refs,
    x,
    y,
    strategy,
    context,
    elements,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    placement,
  } = useFloatingUI({
    open,
    onOpenChange: handleOpenChange,
    placement: placementProp,
    middleware: [
      offset(10),
      flip(),
      shift({ limiter: limitShift() }),
      arrow({ element: arrowRef }),
    ],
  });

  const { getFloatingProps, getReferenceProps } = useInteractions([
    useRole(context, { role: "dialog" }),
    useClick(context),
    useDismiss(context, {
      outsidePressEvent: "pointerdown",
      referencePress: true,
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

  const getOverlayProps = (): HTMLProps<HTMLDivElement> => {
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

  const floatingStyles = () => {
    return {
      top: y ?? 0,
      left: x ?? 0,
      position: strategy,
      width: elements.floating?.offsetWidth,
      height: elements.floating?.offsetHeight,
    };
  };

  return {
    arrowProps,
    context,
    open,
    onOpenChange: handleOpenChange,
    refs,
    floating,
    reference,
    getOverlayProps,
    getTriggerProps,
    floatingStyles,
  };
}
