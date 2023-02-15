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
import {
  margin,
  useControlled,
  useFloatingUI,
  UseFloatingUIProps,
} from "@salt-ds/core";
import {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  JSXElementConstructor,
  useCallback,
  useRef,
} from "react";
import { OverlayProps } from "./Overlay";
import { isDesktop } from "../window";

export type UseOverlayProps = Partial<
  Pick<UseFloatingUIProps, "onOpenChange" | "open" | "placement">
>;

export function useOverlay(props: UseOverlayProps) {
  const { open: openProp, placement = "right", onOpenChange } = props;

  const arrowRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: false,
    name: "Overlay",
    state: "open",
  });
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };
  const middleware = isDesktop
    ? [margin(24), arrow({ element: arrowRef })]
    : [
        offset(24),
        flip(),
        shift({ limiter: limitShift() }),
        arrow({ element: arrowRef }),
      ];
  const {
    reference,
    floating,
    x,
    y,
    strategy,
    context,
    middlewareData,
    update,
  } = useFloatingUI({
    open,
    onOpenChange: handleOpenChange,
    placement,
    middleware,
  });

  const handleArrowRef = useCallback(
    (node: HTMLDivElement) => {
      arrowRef.current = node;
      update();
    },
    [update]
  );

  const { getFloatingProps, getReferenceProps } = useInteractions([
    useDismiss(context),
    useRole(context, { role: "dialog" }),
    useClick(context),
  ]);

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

  const getOverlayProps = (userProps?: OverlayProps) => {
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
      onOpenChange: handleOpenChange,
      ...getFloatingProps({
        // @ts-ignore
        "data-placement": placement,
        ...userProps,
        style: {
          top: y ?? "",
          left: x ?? "",
          position: strategy,
          ...(userProps?.style || {}),
        },
        ref: floating,
      }),
    } as OverlayProps;
  };

  return {
    getTriggerProps,
    getOverlayProps,
  };
}
