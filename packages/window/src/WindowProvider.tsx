import {
  createContext,
  ComponentType,
  ReactNode,
  useMemo,
  useContext,
} from "react";

export interface WindowContextType {
  window: Window & typeof globalThis;
  Component?: ComponentType;
}

const WindowContext = createContext<WindowContextType | null>(
  typeof window !== "undefined"
    ? {
        window,
      }
    : null
);

if (process.env.NODE_ENV !== "production") {
  WindowContext.displayName = "WindowContext";
}

export interface WindowProviderProps extends WindowContextType {
  children: ReactNode;
}

export function WindowProvider(props: WindowProviderProps) {
  const { window: windowProp, Component, children } = props;
  const value = useMemo(
    () => ({ window: windowProp, Component }),
    [windowProp, Component]
  );

  return (
    <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
  );
}

export function useWindow() {
  const value = useContext(WindowContext);
  if (!value) {
    throw new Error("useWindow must be used within a WindowProvider");
  }
  return value;
}
