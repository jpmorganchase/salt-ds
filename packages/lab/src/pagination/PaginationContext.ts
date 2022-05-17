import { createContext } from "react";

export interface PaginationContext {
  page: number;
  count: number;
  compact: boolean;
  onPageChange: (page: number) => void;
  paginatorElement?: HTMLDivElement;
  setPaginatorElement: (element: HTMLDivElement) => void;
}

export const paginationContext = createContext<PaginationContext>({
  page: 0,
  count: 0,
  compact: false,
  onPageChange: () => { },
  paginatorElement: undefined,
  setPaginatorElement: () => { },
});

if (process.env.NODE_ENV !== "production") {
  paginationContext.displayName = "PaginationContext";
}
