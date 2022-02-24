import { createContext } from "react";
import { FormFieldVariantType } from "../form-field";

export interface PaginationContext {
  page: number;
  count: number;
  variant: FormFieldVariantType;
  compact: boolean;
  onPageChange: (page: number) => void;
  paginatorElement?: HTMLDivElement;
  setPaginatorElement: (element: HTMLDivElement) => void;
}

export const paginationContext = createContext<PaginationContext>({
  page: 0,
  count: 0,
  compact: false,
  variant: "filled",
  onPageChange: () => {},
  paginatorElement: undefined,
  setPaginatorElement: () => {},
});

if (process.env.NODE_ENV !== "production") {
  paginationContext.displayName = "PaginationContext";
}
