import { paginationContext } from "./PaginationContext";
import { useContext } from "react";

export const usePaginationContext = () => {
  const context = useContext(paginationContext);
  if (process.env.NODE_ENV !== "production") {
    if (!context) {
      console.error(`usePaginationContext should be used inside of Pagination`);
    }
  }
  return context;
};
