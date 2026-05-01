import { type ComponentType, createElement, forwardRef } from "react";

const warnedKeys = new Set<string>();

const warnOnce = (key: string, message: string) => {
  if (process.env.NODE_ENV === "production") return;
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
};

/**
 * Wrap a component so that a deprecation warning is logged on first render
 * instead of at import time.
 */
export function deprecatedComponent<P extends object>(
  Component: ComponentType<P>,
  displayName: string,
  deprecationKey: string,
  message: string,
) {
  const Wrapped = forwardRef<unknown, P>((props, ref) => {
    warnOnce(deprecationKey, message);
    return createElement(Component, { ...props, ref } as P);
  });
  Wrapped.displayName = displayName;
  return Wrapped as unknown as typeof Component;
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
