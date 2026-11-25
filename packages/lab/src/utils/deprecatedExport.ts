import {
  type ComponentType,
  createElement,
  type ExoticComponent,
  forwardRef,
} from "react";

const warnedKeys = new Set<string>();

const warnOnce = (key: string, message: string) => {
  if (process.env.NODE_ENV !== "production" && !warnedKeys.has(key)) {
    warnedKeys.add(key);
    console.warn(message);
  }
};

/**
 * Wrap a component so that a deprecation warning is logged on first render
 * instead of at import time. The wrapper keeps the component's type, including
 * any type parameters.
 */
export function deprecatedComponent<
  C extends ComponentType<any> | ExoticComponent<any>,
>(Component: C, displayName: string, deprecationKey: string, message: string) {
  const Wrapped = forwardRef<unknown, object>(function Wrapped(props, ref) {
    warnOnce(deprecationKey, message);
    return createElement(Component as ComponentType<any>, { ...props, ref });
  });
  Wrapped.displayName = displayName;
  return Wrapped as unknown as C;
}

/**
 * Wrap a hook or plain function so that a deprecation warning is logged on
 * first call instead of at import time.
 */
export function deprecatedFunction<T extends (...args: any[]) => any>(
  hook: T,
  deprecationKey: string,
  message: string,
): T {
  const wrapped = (...args: any[]) => {
    warnOnce(deprecationKey, message);
    return hook(...args);
  };
  return wrapped as T;
}
