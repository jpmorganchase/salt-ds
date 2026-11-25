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
import { type ReactNode, useMemo, useRef, useState } from "react";
import {
  type UseFloatingUIProps,
  useControlled,
  useFloatingUI,
} from "../utils";
import { OverlayContext, type OverlayContextValue } from "./OverlayContext";

export interface OverlayProps {
  /**
   * The content of the Overlay, typically an `OverlayTrigger` and `OverlayPanel`.
   */
  children?: ReactNode;
  /**
   * If `true`, the Overlay is open. Use with `onOpenChange` to control it.
   */
  open?: boolean;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The placement of the Overlay relative to the trigger element.
   * @default "top"
   */
  placement?: UseFloatingUIProps["placement"];
  /**
   * If `true`, the Overlay arrow is hidden.
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
  const [headerId, setHeaderId] = useState<string | undefined>(undefined);
  const [descriptionId, setDescriptionId] = useState<string | undefined>(
    undefined,
  );

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

  const floatingStyles = useMemo(() => {
    const floatingElement = elements.floating;

    return {
      top: y ?? 0,
      left: x ?? 0,
      position: strategy,
      width: floatingElement?.offsetWidth,
      height: floatingElement?.offsetHeight,
    };
  }, [elements.floating, strategy, x, y]);

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
      headerId,
      setHeaderId,
      descriptionId,
      setDescriptionId,
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
      headerId,
      descriptionId,
    ],
  );

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
    </OverlayContext.Provider>
  );
};
