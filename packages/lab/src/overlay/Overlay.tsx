import { ComponentPropsWithoutRef, forwardRef, useMemo, useRef } from "react";
import { OverlayContext } from "./OverlayContext";
import { useControlled, useFloatingUI, useId } from "@salt-ds/core";
import {
  flip,
  offset,
  shift,
  limitShift,
  arrow,
  useClick,
  useDismiss,
  useInteractions,
  useRole,
} from "@floating-ui/react";

export interface OverlayProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Display or hide the component.
   */
  open?: boolean;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /*
   * Set the placement of the Overlay component relative to the trigger element. Defaults to `top`.
   */
  placement?: "top" | "bottom" | "left" | "right";
}

export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  function Overlay(props, ref) {
    const {
      children,
      open,
      onOpenChange,
      placement: placementProp = "top",
      id: idProp,
      ...rest
    } = props;

    const id = useId(idProp);
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

    const {
      x,
      y,
      strategy,
      context,
      elements,
      floating,
      reference,
      placement,
    } = useFloatingUI({
      open: openState,
      onOpenChange: handleOpenChange,
      placement: placementProp,
      middleware: [
        offset(11),
        flip(),
        shift({ limiter: limitShift() }),
        arrow({ element: arrowRef }),
      ],
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

    const handleCloseButtonClick = () => {
      handleOpenChange(false);
    };

    return (
      <OverlayContext.Provider
        value={{
          id: id ?? "",
          openState,
          floatingStyles,
          placement,
          context,
          arrowProps,
          floating,
          reference,
          handleCloseButtonClick,
          getFloatingProps,
          getReferenceProps,
        }}
      >
        <div ref={ref} {...rest}>
          {children}
        </div>
      </OverlayContext.Provider>
    );
  }
);
