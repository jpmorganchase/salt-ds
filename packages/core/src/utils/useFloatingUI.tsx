import type { Middleware, Placement, Strategy } from "@floating-ui/react";
import {
  autoUpdate,
  flip,
  limitShift,
  shift,
  useFloating,
} from "@floating-ui/react";

export type UseFloatingUIProps = {
  /**
   * Set position relative to trigger
   */
  placement?: Placement;
  strategy?: Strategy;
  middleware?: Middleware[];
  /**
   * Set visible state. Defaults to false
   */
  open?: boolean;
  /**
   * Callback function triggered when open state changes
   */
  onOpenChange?: (open: boolean) => void;
};

export const DEFAULT_FLOATING_UI_MIDDLEWARE = [
  flip(),
  shift({ limiter: limitShift() }),
];

export function useFloatingUI(
  props: UseFloatingUIProps
): ReturnType<typeof useFloating> {
  const {
    placement,
    strategy,
    middleware = DEFAULT_FLOATING_UI_MIDDLEWARE,
    open = false,
    onOpenChange,
  } = props;

  const { reference, floating, refs, update, ...rest } = useFloating({
    placement,
    strategy,
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
