// import type { Props } from "@floating-ui/react-dom-interactions";
import type {
  Middleware,
  Placement,
  Strategy,
} from "@floating-ui/react";
import {
  autoUpdate,
  flip,
  limitShift,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { isDesktop } from "../window";

export type UseFloatingUIProps = {
  placement?: Placement;
  strategy?: Strategy;
  middleware?: Middleware[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};


export const DEFAULT_FLOATING_UI_MIDDLEWARE = isDesktop
  ? []
  : [flip(), shift({ limiter: limitShift() })];

export function useFloatingUI(
  props: UseFloatingUIProps
): ReturnType<typeof useFloating> {
  const {
    placement: placementProp,
    strategy: strategyProp,
    middleware = DEFAULT_FLOATING_UI_MIDDLEWARE,
    open,
    onOpenChange,
  } = props;

  const { reference, floating, refs, update, ...rest } = useFloating({
    placement: placementProp,
    strategy: strategyProp,
    middleware,
    open,
    onOpenChange,
    whileElementsMounted: autoUpdate,
  });

  return {
    reference,
    floating,
    refs,
    update,
    ...rest,
  };
}
