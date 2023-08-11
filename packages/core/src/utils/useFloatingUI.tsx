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
  forwardRef,
  PropsWithChildren,
  ForwardRefExoticComponent,
  Ref,
  RefAttributes,
} from "react";

import { FloatingPortal } from "@floating-ui/react";
import { SaltProvider } from "../salt-provider";

type CombinedFloatingComponentProps = PropsWithChildren<FloatingComponentProps>;
export type FloatingComponentProps = {
  /**
   * Whether the floating component is disabled (used for determinig whether to show the component)
   */
  disabled?: boolean;
  /**
   * Whether the floating component is open (used for determinig whether to show the component)
   * We pass this as a prop rather than not rendering the component to allow more advanced use-cases e.g.
   * for caching windows and reusing them, rather than always spawning a new one
   */
  open: boolean;
  /**
   * Position props for the floating component
   */
  top: number;
  left: number;
  position: Strategy;
};

const DefaultFloatingComponent = forwardRef<
  HTMLElement,
  CombinedFloatingComponentProps
>((props, ref) => {
  const { open, disabled = false, top, left, position, ...rest } = props;
  const style = {
    top,
    left,
    position,
  };
  return open && !disabled ? (
    <FloatingPortal>
      <SaltProvider>
        <div style={style} {...rest} ref={ref as Ref<HTMLDivElement>} />
      </SaltProvider>
    </FloatingPortal>
  ) : null;
});

export interface FloatingComponentContextType {
  Component: typeof DefaultFloatingComponent;
}

const FloatingComponentContext = createContext<FloatingComponentContextType>({
  Component: DefaultFloatingComponent,
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

type FloatingPlatformContextType = {
  platform: Platform;
  middleware: Middleware[];
  animationFrame: boolean;
};

const defaultFloatingPlaform = {
  platform,
  middleware: [],
  animationFrame: false,
};

const FloatingPlatformContext = createContext<FloatingPlatformContextType>(
  defaultFloatingPlaform
);

export interface FloatingPlatformProviderProps {
  platform?: Platform;
  middleware?: Middleware[];
  children: ReactNode;
  animationFrame?: boolean;
}

export function FloatingPlatformProvider(props: FloatingPlatformProviderProps) {
  const {
    platform: platformProp,
    middleware,
    animationFrame,
    children,
  } = props;

  const floatingPlatformContextValue = useMemo<FloatingPlatformContextType>(
    () => ({
      platform: platformProp ?? platform,
      middleware: middleware ?? [],
      animationFrame: animationFrame ?? false,
    }),
    [platformProp, middleware, animationFrame]
  );

  return (
    <FloatingPlatformContext.Provider value={floatingPlatformContextValue}>
      {children}
    </FloatingPlatformContext.Provider>
  );
}

export function useFloatingPlatform() {
  return useContext(FloatingPlatformContext);
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

  const {
    platform: contextPlaform,
    middleware: contextMiddleware,
    animationFrame,
  } = useFloatingPlatform();

  const { reference, floating, refs, update, ...rest } = useFloating({
    placement,
    strategy,
    middleware: [...middleware, ...contextMiddleware],
    open,
    onOpenChange,
    whileElementsMounted: (...args) => {
      const cleanup = autoUpdate(...args, { animationFrame });

      return cleanup;
    },
    platform: contextPlaform,
  });

  return {
    reference,
    floating,
    refs,
    update,
    ...rest,
  };
}
