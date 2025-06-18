import { createContext, type ReactNode, useContext } from "react";

export type WindowContextType = Window | null;

const WindowContext = createContext<WindowContextType | null>(
  typeof window !== "undefined" ? window : null,
);

if (process.env.NODE_ENV !== "production") {
  WindowContext.displayName = "WindowContext";
}

export interface WindowProviderProps {
  children: ReactNode;
  window: WindowContextType;
}

export function WindowProvider(props: WindowProviderProps) {
  const { window: targetWindow, children } = props;

  return (
    <WindowContext.Provider value={targetWindow}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindow(): WindowContextType {
  return useContext(WindowContext);
}
