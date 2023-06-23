import type {
  Middleware,
  Placement,
  Platform,
  Strategy,
} from "@floating-ui/react";
import {
  autoUpdate,
  flip,
  limitShift,
  platform,
  shift,
  useFloating,
} from "@floating-ui/react";
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ComponentType,
} from "react";

import { FloatingPortal } from "@floating-ui/react";
import { SaltProvider } from "../salt-provider";

export interface FloatingComponentProps extends UseFloatingUIProps {
  /**
   * Option to not render the popper.
   */
  disabled: boolean;
}

export interface FloatingComponentContextType {
  Component: ComponentType<PropsWithChildren<FloatingComponentProps>>;
}

const FloatingComponentContext = createContext<FloatingComponentContextType>({
  Component: forwardRef((props, ref: ForwardedRef<HTMLDivElement>) => {
    const { open, disabled, ...rest } = props;
    return open && !disabled ? (
      <FloatingPortal>
        <SaltProvider>
          <div {...rest} ref={ref} />
        </SaltProvider>
      </FloatingPortal>
    ) : null;
  }),
});

if (process.env.NODE_ENV !== "production") {
  FloatingComponentContext.displayName = "FloatingComponentContext";
}

export interface FloatingComponentProviderProps
  extends FloatingComponentContextType {
  children: ReactNode;
}

export function FloatingComponentProvider(
  props: FloatingComponentProviderProps
) {
  const { Component, children } = props;
  const value = useMemo(() => ({ Component }), [Component]);

  return (
    <FloatingComponentContext.Provider value={value}>
      {children}
    </FloatingComponentContext.Provider>
  );
}

export function useFloatingComponent() {
  return useContext(FloatingComponentContext);
}

export type UseFloatingUIProps = {
  /**
   * Sets position relative to trigger.
   */
  placement?: Placement;
  strategy?: Strategy;
  middleware?: Middleware[];
  /**
   * Sets visible state.
   */
  open?: boolean;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
};

const PlatformContext = createContext<Platform>(platform);

export interface FloatingPlatformProviderProps {
  platform: Platform;
  children: ReactNode;
}

export function FloatingPlatformProvider(props: FloatingPlatformProviderProps) {
  const { platform: platformProp, children } = props;

  return (
    <PlatformContext.Provider value={platformProp}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  return useContext(PlatformContext);
}

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

  const platform = usePlatform();

  const { reference, floating, refs, update, ...rest } = useFloating({
    placement,
    strategy,
    middleware,
    open,
    onOpenChange,
    whileElementsMounted: autoUpdate,
    platform,
  });

  return {
    reference,
    floating,
    refs,
    update,
    ...rest,
  };
}
