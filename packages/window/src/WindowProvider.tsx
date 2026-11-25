import { createContext, type ReactNode, useContext } from "react";

export type WindowContextType = Window | null;

const WindowContext = createContext<WindowContextType>(
  typeof window !== "undefined" ? window : null,
);

if (process.env.NODE_ENV !== "production") {
  WindowContext.displayName = "WindowContext";
}

export interface WindowProviderProps {
  /**
   * The content that can access `window` with `useWindow`.
   */
  children: ReactNode;
  /**
   * The window that `useWindow` returns inside the provider, for example a
   * pop-out window. Use `null` when no window is available, such as during
   * server-side rendering.
   */
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
