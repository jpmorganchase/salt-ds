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

type PropsWithClassName = { className?: string } & Record<string, any>;

export function useInjectedClassName<Props extends PropsWithClassName>(
  component: string,
  props: Props,
): { className: string; props: Omit<Props, "className"> } {
  const { className: classNameProp, ...restProps } = props;
  const registry = useContext(InjectionContext);

  if (!registry) {
    return {
      className: classNameProp || "",
      props: restProps as Omit<Props, "className">,
    };
  }

  const entries = registry[component] ?? [];
  const injected = entries.map((e) => e.fn(restProps)).filter(Boolean);
  const className = clsx(classNameProp, injected);

  const cleanProps = { ...restProps } as Omit<Props, "className">;
  for (const entry of entries) {
    for (const key of entry.keys) {
      delete (cleanProps as any)[key];
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
