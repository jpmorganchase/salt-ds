import { createContext, ReactNode, useMemo, useContext } from "react";

export interface InsertionPointContextType {
  insertionPoint: ChildNode | null;
}

const insertionPointContext = createContext<ChildNode | null>(
  window.document.head.firstChild
);

if (process.env.NODE_ENV !== "production") {
  insertionPointContext.displayName = "insertionPointContext";
}

export interface InsertionPointProviderProps extends InsertionPointContextType {
  children: ReactNode;
}

export function InsertionPointProvider(props: InsertionPointProviderProps) {
  const { insertionPoint: insertionPointProp, children } = props;
  const value = useMemo(() => insertionPointProp, [insertionPointProp]);

  return (
    <insertionPointContext.Provider value={value}>
      {children}
    </insertionPointContext.Provider>
  );
}

export function useInsertionPoint() {
  const value = useContext(insertionPointContext);
  return value;
}
