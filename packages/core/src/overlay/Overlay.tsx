import {
  arrow,
  flip,
  limitShift,
  offset,
  shift,
  useClick,
  useDismiss,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { type ComponentPropsWithoutRef, useMemo, useRef } from "react";
import { useControlled, useFloatingUI } from "../utils";
import { OverlayContext } from "./OverlayContext";

export interface OverlayProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Display or hide the component.
   */
  open?: boolean;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Set the placement of the Overlay component relative to the trigger element. Defaults to `top`.
   */
  placement?: "top" | "bottom" | "left" | "right";
  /**
   * When `true`, the arrow indicator is hidden
   */
  hideArrow?: boolean;
}

export const Overlay = ({
  children,
  open,
  onOpenChange,
  placement: placementProp = "top",
  hideArrow = false,
}: OverlayProps) => {
  const arrowRef = useRef<SVGSVGElement | null>(null);

  const [openState, setOpenState] = useControlled({
    controlled: open,
    default: false,
    name: "Overlay",
    state: "open",
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpenState(newOpen);
    onOpenChange?.(newOpen);
  };

  const middleware = hideArrow
    ? [
        offset(1),
        flip(),
        {
          name: "alignStart",
          fn({ rects }: { rects: { reference: { x: number } } }) {
            return { x: rects.reference.x };
          },
        },
        shift({ limiter: limitShift() }),
      ]
    : [
        offset(11),
        flip(),
        shift({ limiter: limitShift() }),
        arrow({ element: arrowRef }),
      ];

  const { x, y, strategy, context, elements, floating, reference } =
    useFloatingUI({
      open: openState,
      onOpenChange: handleOpenChange,
      placement: placementProp,
      middleware,
    });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useRole(context, { role: "dialog" }),
    useClick(context),
    useDismiss(context),
  ]);

  const floatingStyles = useMemo(() => {
    return {
      top: y ?? 0,
      left: x ?? 0,
      position: strategy,
      width: elements.floating?.offsetWidth,
      height: elements.floating?.offsetHeight,
    };
  }, [elements.floating, strategy, x, y]);

  const arrowProps = {
    ref: arrowRef,
    context,
  };

  return (
    <OverlayContext.Provider
      value={{
        openState,
        floatingStyles,
        context,
        arrowProps: hideArrow ? undefined : arrowProps,
        floating,
        reference,
        getFloatingProps,
        getReferenceProps,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};
