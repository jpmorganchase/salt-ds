import { createContext } from "react";

export const ScrimContext = createContext<(() => void) | undefined>(undefined);

if (process.env.NODE_ENV !== "production") {
  ScrimContext.displayName = "ScrimContext";
}
