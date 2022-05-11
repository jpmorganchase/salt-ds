import { createContext, useContext } from "react";

export const WindowParentContext = createContext<{
  top: number;
  left: number;
  id: string;
}>({ top: 0, left: 0, id: "" });

export const useWindowParentContext = () => useContext(WindowParentContext);
