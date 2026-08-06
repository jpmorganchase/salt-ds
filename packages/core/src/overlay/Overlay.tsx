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
import { type ReactNode, useCallback, useMemo, useRef } from "react";
import { useControlled, useFloatingUI } from "../utils";
import { OverlayContext, type OverlayContextValue } from "./OverlayContext";

export interface OverlayProps {
  /**
   * The content of the Overlay, typically an `OverlayTrigger` and `OverlayPanel`.
   */
  children?: ReactNode;
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

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const middleware = useMemo(
    () => [
      offset(8),
      flip(),
      shift({ limiter: limitShift() }),
      arrow({ element: arrowRef }),
    ],
    [],
  );

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

  const floatingElement = elements.floating;
  const floatingHeight = floatingElement?.offsetHeight;
  const floatingWidth = floatingElement?.offsetWidth;

  const floatingStyles = useMemo(() => {
    return {
      top: y ?? 0,
      left: x ?? 0,
      position: strategy,
      width: floatingWidth,
      height: floatingHeight,
    };
  }, [floatingHeight, floatingWidth, strategy, x, y]);

  const arrowProps = useMemo(
    () => ({
      ref: arrowRef,
      context,
    }),
    [context],
  );

  const contextValue = useMemo<OverlayContextValue>(
    () => ({
      openState,
      floatingStyles,
      context,
      arrowProps,
      hideArrow,
      floating,
      reference,
      getFloatingProps,
      getReferenceProps,
    }),
    [
      openState,
      floatingStyles,
      context,
      arrowProps,
      hideArrow,
      floating,
      reference,
      getFloatingProps,
      getReferenceProps,
    ],
  );

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
    </OverlayContext.Provider>
  );
};
