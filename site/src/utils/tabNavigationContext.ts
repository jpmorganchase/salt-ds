import { createContext } from "react";
import type { createTabNavigation } from "./tabNavigation";

export const TabNavigationContext = createContext<
  ReturnType<typeof createTabNavigation> | undefined
>(undefined);
