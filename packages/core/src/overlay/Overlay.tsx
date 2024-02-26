import {
  ComponentPropsWithoutRef,
  forwardRef,
  SyntheticEvent,
  useMemo,
  useRef,
} from "react";
import { OverlayContext } from "./OverlayContext";
import { useControlled, useFloatingUI, useId } from "../utils";
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
  open?: boolean;
  onOpenChange?: (event: SyntheticEvent, newOpen: boolean) => void;
  /*
   * Set the placement of the Overlay component relative to the trigger element. Defaults to `top`.
   */
  placement?: "top" | "bottom" | "left" | "right";
  /*
   * Use in controlled version to close Overlay.
   */
  onClose?: (event: SyntheticEvent) => void;
}

export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  function Overlay(props, ref) {
    const {
      children,
      open,
      onOpenChange,
      placement: placementProp = "top",
      id: idProp,
      onClose,
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
      onOpenChange: setOpenState,
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

    const setOpen = (event: SyntheticEvent, newOpen: boolean) => {
      setOpenState(newOpen);
      onOpenChange?.(event, newOpen);
    };

    const arrowProps = {
      ref: arrowRef,
      context,
    };

    const handleCloseButton = (event: SyntheticEvent) => {
      setOpen(event, false);
      onClose?.(event);
    };

    return (
      <OverlayContext.Provider
        value={{
          id: id ?? "",
          openState,
          setOpen,
          floatingStyles,
          placement,
          context,
          arrowProps,
          floating,
          reference,
          handleCloseButton,
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
