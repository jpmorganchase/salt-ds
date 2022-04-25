import {
  autoUpdate,
  flip,
  limitShift,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import type { Placement, Strategy, Middleware } from "@floating-ui/core";
import { useEffect } from "react";
import {isElectron} from "../window";

export interface UseFloatingUIProps {
  middleware?: Middleware[];
  /**
   * Controls placement of the popper.
   */
  placement: Placement;
  strategy?: Strategy;
}

export const DEFAULT_FLOATING_UI_MIDDLEWARE = isElectron
  ? []
  : [flip(), shift({ limiter: limitShift() })];

export function useFloatingUI(props: UseFloatingUIProps) {
  const {
    placement: placementProp,
    strategy: strategyProp,
    middleware = DEFAULT_FLOATING_UI_MIDDLEWARE,
  } = props;

  const { reference, floating, refs, update, ...rest } = useFloating({
    placement: placementProp,
    strategy: strategyProp,
    middleware,
  });

  // Update on scroll and resize for all relevant nodes
  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) {
      return;
    }

    return autoUpdate(refs.reference.current, refs.floating.current, update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refs.reference.current, refs.floating.current, update]);

  return {
    reference,
    floating,
    update,
    refs,
    ...rest,
  };
}
