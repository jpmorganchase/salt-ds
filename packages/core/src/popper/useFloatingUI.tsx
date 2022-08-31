import type { Props } from "@floating-ui/react-dom-interactions";
import {
  autoUpdate,
  flip,
  limitShift,
  shift,
  useFloating,
} from "@floating-ui/react-dom-interactions";
import { isDesktop } from "../window";

export type UseFloatingUIProps = Partial<
  Pick<Props, "placement" | "strategy" | "middleware" | "open" | "onOpenChange">
>;

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
