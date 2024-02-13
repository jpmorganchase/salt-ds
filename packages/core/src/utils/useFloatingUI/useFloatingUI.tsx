import {
  FloatingFocusManager,
  FloatingFocusManagerProps,
  FloatingPortal,
  Middleware,
  Platform,
  Strategy,
  UseFloatingOptions,
  autoUpdate,
  flip,
  limitShift,
  platform,
  shift,
  useFloating,
} from "@floating-ui/react";
import {
  ComponentPropsWithoutRef,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useMemo,
} from "react";
import {
  SaltProvider,
  UNSTABLE_SaltProviderNext,
  useTheme,
} from "../../salt-provider";

export interface FloatingComponentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether the floating component is open (used for determining whether to show the component)
   * We pass this as a prop rather than not rendering the component to allow more advanced use-cases e.g.
   * for caching windows and reusing them, rather than always spawning a new one
   */
  open: boolean;
  /**
   * Use this prop when `FloatingFocusManager` is needed for floating component
   */
  focusManagerProps?: Omit<FloatingFocusManagerProps, "children">;
  /**
   * Position props for the floating component
   */
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  position?: Strategy;
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
    focusManagerProps,
    ...rest
  } = props;
  const style = {
    top,
    left,
    position,
  };

  const { themeNext } = useTheme();

  const ChosenSaltProvider = themeNext
    ? UNSTABLE_SaltProviderNext
    : SaltProvider;

  if (focusManagerProps) {
    return (
      <FloatingPortal>
        <ChosenSaltProvider>
          <FloatingFocusManager {...focusManagerProps}>
            <div style={style} {...rest} ref={ref} />
          </FloatingFocusManager>
        </ChosenSaltProvider>
      </FloatingPortal>
    );
  }

  return open ? (
    <FloatingPortal>
      <ChosenSaltProvider>
        <div style={style} {...rest} ref={ref} />
      </ChosenSaltProvider>
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

export interface UseFloatingUIProps
  extends Pick<
    UseFloatingOptions,
    "placement" | "strategy" | "open" | "onOpenChange"
  > {
  /**
   * Function to update the default middleware used to extend or replace it
   */
  middleware?: Middleware[];
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

  const handleOpenChange: UseFloatingUIProps["onOpenChange"] = (
    open,
    boolean,
    reason
  ) => {
    update();
    onOpenChange?.(open, boolean, reason);
  };

  const {
    platform: contextPlatform,
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
    platform: contextPlatform,
  });

  return {
    reference: refs.setReference,
    floating: refs.setFloating,
    refs,
    update,
    ...rest,
  };
}
