import { useContext } from "react";
import { paginationContext } from "./PaginationContext";

export const usePaginationContext = () => {
  const context = useContext(paginationContext);
  if (process.env.NODE_ENV !== "production") {
    if (!context) {
      console.error(`usePaginationContext should be used inside of Pagination`);
    }
  }
  return context;
};
