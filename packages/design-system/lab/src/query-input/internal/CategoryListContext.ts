import { createContext, useContext } from "react";

export interface CategoryListContext {
  width: number;
}

export const CategoryListContext = createContext<
  CategoryListContext | undefined
>(undefined);

export function useCategoryListContext(): CategoryListContext {
  const context = useContext(CategoryListContext);
  if (!context) {
    throw new Error(
      `useCategoryListContext should be used inside CategoryList`
    );
  }
  return context;
}
