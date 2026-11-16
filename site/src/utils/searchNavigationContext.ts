import { createContext } from "react";
import type { createSearchNavigation } from "./searchNavigation";

export const SearchNavigationContext = createContext<
  ReturnType<typeof createSearchNavigation> | undefined
>(undefined);
