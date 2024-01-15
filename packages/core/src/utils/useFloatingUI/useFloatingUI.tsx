import {
  Middleware,
  Placement,
  Platform,
  Strategy,
  autoUpdate,
  flip,
  limitShift,
  platform,
  shift,
  useFloating,
  FloatingPortal,
} from "@floating-ui/react";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  forwardRef,
  ComponentPropsWithoutRef,
} from "react";

import { SaltProvider } from "../../salt-provider";

export interface FloatingComponentProps
  extends ComponentPropsWithoutRef<"div"> {
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
  width?: number;
  height?: number;
  position: Strategy;
}

const DefaultFloatingComponent = forwardRef<
  HTMLDivElement,
  FloatingComponentProps
>(function DefaultFloatingComponent(props, ref) {
  const {
    open,
    top,
    left,
    position,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    width,
    height,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ...rest
  } = props;
  const style = {
    top,
    left,
    position,
  };
  return open ? (
    <FloatingPortal>
      <SaltProvider>
        <div style={style} {...rest} ref={ref} />
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

export interface UseFloatingUIProps {
  /**
   * Sets position relative to trigger.
   */
  placement?: Placement;
  strategy?: Strategy;
  /**
   * Function to update the default middleware used to extend or replace it
   */
  middleware?: Middleware[];
  /**
   * Sets visible state.
   */
  open?: boolean;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
}

type GetMiddleware = (middleware: Middleware[]) => Middleware[];

const defaultGetMiddleware: GetMiddleware = (defaultMiddleware) =>
  defaultMiddleware;

interface FloatingPlatformContextType {
  platform: Platform;
  middleware: GetMiddleware;
  animationFrame: boolean;
}

const defaultFloatingPlaform: FloatingPlatformContextType = {
  platform,
  middleware: defaultGetMiddleware,
  animationFrame: false,
};

const FloatingPlatformContext = createContext<FloatingPlatformContextType>(
  defaultFloatingPlaform
);

export interface FloatingPlatformProviderProps {
  platform?: Platform;
  middleware?: GetMiddleware;
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
      middleware: middleware ?? defaultGetMiddleware,
      animationFrame: animationFrame || false,
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

type UseFloatingRefs = ReturnType<typeof useFloating>["refs"];

export interface UseFloatingUIReturn extends ReturnType<typeof useFloating> {
  reference: UseFloatingRefs["setReference"];
  floating: UseFloatingRefs["setFloating"];
}

export function useFloatingUI(props: UseFloatingUIProps): UseFloatingUIReturn {
  const {
    placement,
    strategy,
    middleware = DEFAULT_FLOATING_UI_MIDDLEWARE,
    open = false,
    onOpenChange,
  } = props;

  const handleOpenChange = (open: boolean) => {
    update();
    onOpenChange?.(open);
  };

  const {
    platform: contextPlaform,
    middleware: contextMiddleware,
    animationFrame,
  } = useFloatingPlatform();

  const { refs, update, ...rest } = useFloating({
    placement,
    strategy,
    middleware: contextMiddleware(middleware),
    open,
    onOpenChange: handleOpenChange,
    whileElementsMounted: (...args) => {
      const cleanup = autoUpdate(...args, { animationFrame });

      return cleanup;
    },
    platform: contextPlaform,
  });

  return {
    reference: refs.setReference,
    floating: refs.setFloating,
    refs,
    update,
    ...rest,
  };
}
