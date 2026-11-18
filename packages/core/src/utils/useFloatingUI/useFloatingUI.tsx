import {
  autoUpdate,
  FloatingFocusManager,
  type FloatingFocusManagerProps,
  FloatingPortal,
  flip,
  limitShift,
  type Middleware,
  type Platform,
  platform,
  type Strategy,
  shift,
  type UseFloatingOptions,
  useFloating,
} from "@floating-ui/react";
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import { SaltProvider, SaltProviderNext, useTheme } from "../../salt-provider";
import { usePreventScroll } from "../usePreventScroll";

export interface FloatingComponentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the floating component is shown. It's passed as a prop instead
   * of not rendering the component to allow more advanced use cases, for
   * example caching windows and reusing them instead of always creating a new
   * one.
   */
  open: boolean;
  /**
   * Props applied to the `FloatingFocusManager` component. When set, the
   * floating component is wrapped in a `FloatingFocusManager` to manage focus.
   */
  focusManagerProps?: Omit<FloatingFocusManagerProps, "children">;
  /**
   * The top position of the floating component in pixels, applied as its `top`
   * style.
   */
  top?: number;
  /**
   * The left position of the floating component in pixels, applied as its
   * `left` style.
   */
  left?: number;
  /**
   * The width of the floating component in pixels. The default floating
   * component doesn't use it, but a custom one set with
   * `FloatingComponentProvider` can use it to size its container.
   */
  width?: number;
  /**
   * The height of the floating component in pixels. The default floating
   * component doesn't use it, but a custom one set with
   * `FloatingComponentProvider` can use it to size its container.
   */
  height?: number;
  /**
   * The positioning strategy of the floating component, applied as its
   * `position` style.
   */
  position?: Strategy;
  /**
   * If `true`, the page can't be scrolled while the floating component is
   * open.
   */
  lockScroll?: boolean;
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
    width: _width,
    height: _height,
    focusManagerProps,
    lockScroll,
    style: styleProp,
    ...rest
  } = props;
  const style = {
    ...styleProp,
    top,
    left,
    position,
  };

  const { themeNext } = useTheme();
  usePreventScroll({ isDisabled: !lockScroll || !open });

  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;

  if (focusManagerProps && open) {
    return (
      <FloatingPortal>
        <ChosenSaltProvider applyClassesTo="scope">
          <FloatingFocusManager {...focusManagerProps}>
            <div style={style} {...rest} ref={ref} />
          </FloatingFocusManager>
        </ChosenSaltProvider>
      </FloatingPortal>
    );
  }

  return open ? (
    <FloatingPortal>
      <ChosenSaltProvider applyClassesTo="scope">
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
  /**
   * The content that uses the provided `Component` to render floating
   * components.
   */
  children: ReactNode;
}

export function FloatingComponentProvider(
  props: FloatingComponentProviderProps,
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
    | "placement"
    | "strategy"
    | "open"
    | "onOpenChange"
    | "nodeId"
    | "rootContext"
  > {
  /**
   * Function to update the default middleware used to extend or replace it.
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
  defaultFloatingPlaform,
);

export interface FloatingPlatformProviderProps {
  /**
   * The Floating UI platform used to position floating components. When not
   * set, Floating UI's default `platform` is used.
   */
  platform?: Platform;
  /**
   * The function that changes the middleware of floating components. It
   * receives the middleware that a component would use and returns the
   * middleware to use instead. When not set, the middleware isn't changed.
   */
  middleware?: GetMiddleware;
  /**
   * The content that uses the provided platform settings.
   */
  children: ReactNode;
  /**
   * If `true`, floating components update their position on every animation
   * frame.
   */
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
    [platformProp, middleware, animationFrame],
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

export const DEFAULT_FLOATING_UI_MIDDLEWARE: Middleware[] = [
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
    middleware = DEFAULT_FLOATING_UI_MIDDLEWARE,
    open = false,
    onOpenChange,
    ...other
  } = props;

  const handleOpenChange: UseFloatingUIProps["onOpenChange"] = (
    open,
    boolean,
    reason,
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
    ...other,
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
