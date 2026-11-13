import { createContext, type ReactNode, useContext, useMemo } from "react";

/**
 * Extensible map of components -> curated defaultable props.
 * @salt-ds/core augments this interface with component keys and allowed props.
 */
export interface ComponentDefaultablePropsMap {}

type SupportedDefaultComponent =
  keyof ComponentDefaultablePropsMap extends never
    ? "ComponentDefaultablePropsMap must be augmented to define the components that support useComponentDefaults"
    : keyof ComponentDefaultablePropsMap;

type PropsOf<ComponentName extends SupportedDefaultComponent> =
  ComponentName extends keyof ComponentDefaultablePropsMap
    ? ComponentDefaultablePropsMap[ComponentName]
    : never;

export type DataAttributeValue = string | number | boolean | undefined;
export type RootDataAttributes = Record<`data-${string}`, DataAttributeValue>;

export type ComponentDefaultsPayload<Props> = {
  props?: Partial<Props>;
  rootDataAttributes?: RootDataAttributes;
};

export type ComponentDefaultsRegistry<
  ComponentName extends SupportedDefaultComponent = SupportedDefaultComponent,
> = {
  [K in ComponentName]?: ComponentDefaultsPayload<PropsOf<K>>;
};

const EMPTY_REGISTRY: ComponentDefaultsRegistry = {};
const ComponentDefaultsContext =
  createContext<ComponentDefaultsRegistry>(EMPTY_REGISTRY);

export type ComponentDefaultsProviderProps = {
  children: ReactNode;
  value?: ComponentDefaultsRegistry;
};

type AnyDefaultsPayload = ComponentDefaultsPayload<Record<string, any>>;
type LooseDefaultsRegistry = Record<string, AnyDefaultsPayload | undefined>;

const mergePayload = (
  outer?: AnyDefaultsPayload,
  inner?: AnyDefaultsPayload,
): AnyDefaultsPayload | undefined => {
  if (!outer) return inner;
  if (!inner) return outer;

  const props =
    outer.props || inner.props ? { ...outer.props, ...inner.props } : undefined;
  const rootDataAttributes =
    outer.rootDataAttributes || inner.rootDataAttributes
      ? { ...outer.rootDataAttributes, ...inner.rootDataAttributes }
      : undefined;

  if (!props && !rootDataAttributes) {
    return undefined;
  }

  return { props, rootDataAttributes };
};

const mergeRegistries = (
  outer: ComponentDefaultsRegistry,
  inner?: ComponentDefaultsRegistry,
): ComponentDefaultsRegistry => {
  if (!inner) return outer;

  const outerLoose = outer as LooseDefaultsRegistry;
  const innerLoose = inner as LooseDefaultsRegistry;
  let mergedLoose = outerLoose;

  for (const [component, innerPayload] of Object.entries(innerLoose)) {
    if (!innerPayload) continue;

    const outerPayload = outerLoose[component];
    const nextPayload = mergePayload(outerPayload, innerPayload);

    if (nextPayload !== outerPayload) {
      if (mergedLoose === outerLoose) {
        mergedLoose = { ...outerLoose };
      }
      mergedLoose[component] = nextPayload;
    }
  }

  return mergedLoose as ComponentDefaultsRegistry;
};

export function ComponentDefaultsProvider({
  children,
  value,
}: ComponentDefaultsProviderProps) {
  const outerRegistry = useContext(ComponentDefaultsContext);
  const registry = useMemo(
    () => mergeRegistries(outerRegistry, value),
    [outerRegistry, value],
  );

  return (
    <ComponentDefaultsContext.Provider value={registry}>
      {children}
    </ComponentDefaultsContext.Provider>
  );
}

const getRootDataAttributes = (
  props: Record<string, any>,
  defaults: RootDataAttributes | undefined,
): RootDataAttributes | undefined => {
  if (!defaults) return undefined;

  let computed: RootDataAttributes | undefined;
  for (const [key, value] of Object.entries(defaults)) {
    if (!key.startsWith("data-") || value === undefined) continue;
    if (props[key] !== undefined) continue;

    if (!computed) {
      computed = {};
    }
    computed[key as `data-${string}`] = value;
  }

  return computed;
};

/**
 * Applies curated provider defaults for a component key.
 * Explicit props win over provider defaults.
 */
export function useComponentDefaults<
  ComponentName extends SupportedDefaultComponent,
  Props extends Record<string, any> & Partial<PropsOf<ComponentName>>,
>(
  component: ComponentName,
  props: Props,
): { props: Props; rootDataAttributes: RootDataAttributes | undefined } {
  const registry = useContext(ComponentDefaultsContext);

  const defaults = registry[component] as
    | ComponentDefaultsPayload<PropsOf<ComponentName>>
    | undefined;

  return useMemo(() => {
    if (!defaults) {
      return { props, rootDataAttributes: undefined };
    }

    let mergedProps = props;
    if (defaults.props) {
      for (const [key, value] of Object.entries(defaults.props)) {
        if (
          value === undefined ||
          (mergedProps as Record<string, any>)[key] !== undefined
        ) {
          continue;
        }
        if (mergedProps === props) {
          mergedProps = { ...props };
        }
        (mergedProps as Record<string, any>)[key] = value;
      }
    }

    const rootDataAttributes = getRootDataAttributes(
      mergedProps as Record<string, any>,
      defaults.rootDataAttributes,
    );

    return { props: mergedProps, rootDataAttributes };
  }, [defaults, props]);
}

