import { clsx } from "clsx";
import { createContext, useContext, useEffect, useMemo } from "react";

/**
 * Extensible map of supported components → their props.
 * @salt-ds/core must augment this with the components that support the API,
 * using the same key string that the component passes to useClassNameInjection,
 * e.g., "saltButton": ButtonProps.
 */
export interface ComponentPropsMap {}

type SupportedComponent = keyof ComponentPropsMap extends never
  ? "ComponentPropsMap must be augmented to define the components that support useClassNameInjection"
  : keyof ComponentPropsMap;

export type ClassNameInjector<Props, Keys extends keyof Props> = (
  props: Pick<Props, Keys>,
) => string | undefined;

interface ClassNameInjectorEntry {
  fn: (props: unknown) => string | undefined;
  keys: string[];
}

export type ClassNameInjectionRegistry<
  ComponentName extends SupportedComponent = SupportedComponent,
> = Map<ComponentName, ClassNameInjectorEntry[]>;

const EMPTY_REGISTRY: ClassNameInjectionRegistry = new Map();
const InjectionContext =
  createContext<ClassNameInjectionRegistry>(EMPTY_REGISTRY);

export type ClassNameInjectionProviderProps = {
  children: React.ReactNode;
  value?: ClassNameInjectionRegistry;
};

let hasWarnedExperimentalOnce = false;

export function ClassNameInjectionProvider({
  children,
  value,
}: ClassNameInjectionProviderProps) {
  const registry = useMemo(() => value ?? EMPTY_REGISTRY, [value]);

  useEffect(() => {
    if (!hasWarnedExperimentalOnce && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "Salt ClassNameInjectionProvider is experimental and subject to change. JPM users: only recommended in non-production environments or with prior permission from the Salt team.",
      );
      hasWarnedExperimentalOnce = true;
    }
  }, []);

  return (
    <InjectionContext.Provider value={registry}>
      {children}
    </InjectionContext.Provider>
  );
}

type PropsWithClassName = { className?: string } & Record<string, any>;

/**
 * Return the className created by the registry and a props object with injector keys stripped.
 * Only components declared in ComponentPropsMap can call this at compile time.
 */
export function useClassNameInjection<
  Props extends PropsWithClassName,
  ComponentName extends SupportedComponent = SupportedComponent,
>(
  component: ComponentName,
  props: Props,
): { className: string | undefined; props: Omit<Props, "className"> } {
  const registry = useContext(InjectionContext);
  const entries = registry.get(component) ?? [];

  const deps = useMemo(
    () =>
      entries.length
        ? entries.flatMap((e) => e.keys.map((k) => (props as any)[k]))
        : [],
    [entries, props],
  );

  // Compute injected classes provided through ClassNameInjectionRegistry
  const injected = useMemo(() => {
    const { className: _ignore, ...restProps } = props as any;
    if (!entries.length) return [];
    return entries
      .map((e) => e.fn(restProps))
      .filter((v): v is string => v != null);
  }, [entries, deps, props]);

  // Merge original className with injected classes
  const className = useMemo(
    () => clsx((props as any).className, injected) || undefined,
    [props, injected],
  );

  // Create a cleaned props object by stripping keys used by injectors, to avoid DOM errors with unknown attributes
  const cleanProps = useMemo(() => {
    const { className: _ignore, ...restProps } = props as any;
    if (!entries.length) {
      return restProps as Omit<Props, "className">;
    }
    const copy = { ...restProps } as Omit<Props, "className">;
    for (const entry of entries) {
      for (const key of entry.keys) {
        if (Object.hasOwn(copy, key)) {
          delete (copy as any)[key];
        }
      }
    }
    return copy;
  }, [entries, deps, props]);

  return { className, props: cleanProps };
}

/**
 * Register a class injector for a supported component name.
 * - Keys must be valid string keys for that component’s props (as declared in ComponentPropsMap).
 * - Injector receives only the declared keys (Pick<PropsOf<C>, Keys>).
 */
export function registerClassInjector<
  Props extends Record<string, any>,
  Keys extends Extract<keyof Props, string>,
  ComponentName extends SupportedComponent = SupportedComponent,
>(
  registry: ClassNameInjectionRegistry,
  component: ComponentName,
  keys: Keys[],
  injector: ClassNameInjector<Props, Keys>,
) {
  if (!registry.has(component)) {
    registry.set(component, []);
  }

  const wrapped = (props: Record<string, any>) => {
    const picked = Object.fromEntries(keys.map((k) => [k, props[k]])) as Pick<
      Props,
      Keys
    >;
    return injector(picked);
  };

  registry.get(component)!.push({
    fn: wrapped as (props: unknown) => string | undefined,
    keys: keys as string[],
  });
}
