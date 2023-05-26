import { createContext, ReactNode, useContext } from "react";

export type WindowContextType = Window;

const WindowContext = createContext<WindowContextType | null>(
  typeof window !== "undefined" ? window : null
);

if (process.env.NODE_ENV !== "production") {
  WindowContext.displayName = "WindowContext";
}

export interface WindowProviderProps extends WindowContextType {
  children: ReactNode;
}

export function WindowProvider(props: WindowProviderProps) {
  const { window: targetWindow, children } = props;

  return (
    <WindowContext.Provider value={targetWindow}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindow() {
  const value = useContext(WindowContext);
  if (!value) {
    throw new Error("useWindow must be used within a WindowProvider");
  }
  return value;
}
