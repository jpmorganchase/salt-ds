import { createContext, type ReactNode, useContext } from "react";
export interface StyleInjectionContextType {
  value?: boolean;
}

const StyleInjectionContext = createContext(true);

export function useStyleInjection(enableStyleInjection?: boolean): boolean {
  const enableStyleInjectionFromContext = useContext(StyleInjectionContext);
  return enableStyleInjection ?? enableStyleInjectionFromContext;
}

export interface StyleInjectionProviderProps extends StyleInjectionContextType {
  children: ReactNode;
}

export function StyleInjectionProvider(props: StyleInjectionProviderProps) {
  const { value: enableStyleInjectionProp, children } = props;
  const value = useStyleInjection(enableStyleInjectionProp);

  return (
    <StyleInjectionContext.Provider value={value}>
      {children}
    </StyleInjectionContext.Provider>
  );
}
