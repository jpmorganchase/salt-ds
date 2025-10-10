import { clsx } from "clsx";
import { createContext, useContext, useMemo } from "react";

export type ClassNameInjector<Props, Keys extends keyof Props> = (
  props: Pick<Props, Keys>,
) => string | undefined;

interface ClassNameInjectorEntry<Props> {
  fn: (props: Props) => string | undefined;
  keys: (keyof Props)[];
}

export type ClassNameInjectionRegistry = Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: refer to ClassNameInjector which derives it's entry type based on the Props
  ClassNameInjectorEntry<any>[]
>;

const InjectionContext = createContext<ClassNameInjectionRegistry | null>(null);

export type ClassNameInjectionProviderProps = {
  children: React.ReactNode;
  value?: ClassNameInjectionRegistry;
};

export function ClassNameInjectionProvider({
  children,
  value,
}: ClassNameInjectionProviderProps) {
  const registry = useMemo(() => value ?? {}, [value]);
  return (
    <InjectionContext.Provider value={registry}>
      {children}
    </InjectionContext.Provider>
  );
}

export function useInjectedClassName<
  // biome-ignore lint/suspicious/noExplicitAny: props are passed through to the callback as-is
  Props extends Record<string, any>,
>(component: string, props: Props): { className: string; props: Props } {
  const registry = useContext(InjectionContext);
  if (!registry) {
    return { className: props?.className || "", props };
  }
  const entries = registry[component] ?? [];
  const injected = entries.map((e) => e.fn(props)).filter(Boolean);
  const className = clsx(props?.className, injected);

  const cleanProps: Props = { ...props };

  for (const entry of entries) {
    for (const key of entry.keys) {
      delete cleanProps[key as string];
    }
  }
  return { className, props: cleanProps };
}

export function registerClassInjector<Props, Keys extends keyof Props>(
  registry: ClassNameInjectionRegistry,
  component: string,
  keys: Keys[],
  injector: ClassNameInjector<Props, Keys>,
) {
  registry[component] ??= [];
  const wrapped = (props: Props) => injector(props as Props);
  registry[component] = [...registry[component], { fn: wrapped, keys }];
}
