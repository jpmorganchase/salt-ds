import { createContext, useContext } from "react";

export const WindowParentContext = createContext<Window | null>(null);

export const useWindowParentContext = () => useContext(WindowParentContext);

export const WindowParentPositionContext = createContext<{
  top: number;
  left: number;
}>({ top: 0, left: 0 });

export const useWindowParentPositionContext = () =>
  useContext(WindowParentPositionContext);
