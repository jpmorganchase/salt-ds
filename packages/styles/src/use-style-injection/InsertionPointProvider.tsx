import { createContext, type ReactNode, useContext, useMemo } from "react";

export interface InsertionPointContextType {
  insertionPoint: ChildNode | null;
}

const InsertionPointContext = createContext<ChildNode | null>(null);

if (process.env.NODE_ENV !== "production") {
  InsertionPointContext.displayName = "InsertionPointContext";
}

export interface InsertionPointProviderProps extends InsertionPointContextType {
  children: ReactNode;
}

export function InsertionPointProvider(props: InsertionPointProviderProps) {
  const { insertionPoint: insertionPointProp, children } = props;
  const value = useMemo(() => insertionPointProp, [insertionPointProp]);

  return (
    <InsertionPointContext.Provider value={value}>
      {children}
    </InsertionPointContext.Provider>
  );
}

export function useInsertionPoint() {
  const value = useContext(InsertionPointContext);
  return value;
}
