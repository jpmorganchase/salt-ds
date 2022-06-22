import { useFloatingUI, UseFloatingUIProps } from "../popper";
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
} from "@floating-ui/react-dom-interactions";
import { useAriaAnnounce } from "./useAriaAnnounce";
import { useControlled } from "../utils";
import {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  JSXElementConstructor,
  useCallback,
  useRef,
} from "react";
import { TooltipProps } from "./Tooltip";

export interface UseTooltipProps
  extends Partial<
    Pick<UseFloatingUIProps, "onOpenChange" | "open" | "placement">
  > {
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
    enterDelay = 100,
    leaveDelay = 0,
    open: openProp,
    onOpenChange,
    placement: placementProp = "right",
    disabled,
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

  const {
    floating,
    reference,
    x,
    y,
    strategy,
    update,
    middlewareData,
    placement,
    context,
  } = useFloatingUI({
    open,
    onOpenChange: handleOpenChange,
    placement: placementProp,
    middleware: [
      offset(8),
      flip(),
      shift({
        limiter: limitShift({
          offset: () =>
            Math.max(
              arrowRef.current?.offsetWidth ?? 0,
              arrowRef.current?.offsetHeight ?? 0
            ),
        }),
      }),
      arrow({ element: arrowRef }),
    ],
  });

  const handleArrowRef = useCallback(
    (node: HTMLDivElement) => {
      arrowRef.current = node;
      update();
    },
    [update]
  );

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
    useDismiss(context, { ancestorScroll: true }),
    useAriaAnnounce(context, {
      delay: {
        open: enterDelay,
        close: leaveDelay,
      },
    }),
  ]);

  const getTooltipProps = (userProps?: TooltipProps): TooltipProps => {
    const arrowProps = {
      ref: handleArrowRef,
      style: {
        left: middlewareData.arrow?.x ?? "",
        top: middlewareData.arrow?.y ?? "",
      },
    };

    return {
      arrowProps,
      open,
      ...getFloatingProps({
        // @ts-ignore
        "data-placement": placement,
        ...userProps,
        ref: floating,
        style: {
          top: y ?? "",
          left: x ?? "",
          position: strategy,
          ...(userProps?.style || {}),
        },
      }),
    } as TooltipProps;
  };

  const getTriggerProps = <
    Element extends
      | keyof JSX.IntrinsicElements
      | JSXElementConstructor<any> = "div"
  >(
    userProps?: ComponentPropsWithoutRef<Element>
  ) => {
    return getReferenceProps({
      ...userProps,
      ref: reference,
    }) as ComponentPropsWithRef<Element>;
  };

  if (disabled) {
    return {
      getTooltipProps: (args?: TooltipProps) => args,
      getTriggerProps: <
        Element extends
          | keyof JSX.IntrinsicElements
          | JSXElementConstructor<any> = "div"
      >(
        args?: ComponentPropsWithRef<Element>
      ) => args as ComponentPropsWithRef<Element>,
    };
  }

  return {
    getTooltipProps,
    getTriggerProps,
  };
}
