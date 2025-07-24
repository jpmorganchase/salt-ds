import { createContext, type SyntheticEvent } from "react";

export interface PaginationContext {
  page: number;
  count: number;
  onPageChange: (event: SyntheticEvent, page: number) => void;
}

export const paginationContext = createContext<PaginationContext>({
  page: 0,
  count: 0,
  onPageChange: () => undefined,
});

if (process.env.NODE_ENV !== "production") {
  paginationContext.displayName = "PaginationContext";
}
