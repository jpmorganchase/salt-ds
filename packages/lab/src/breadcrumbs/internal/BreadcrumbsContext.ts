import { createContext, useContext } from "react";

export interface BreadcrumbsContext {
  wrap?: boolean;
  itemsMaxWidth?: number | string;
  itemsMinWidth?: number | string;
  liClass?: string;
}

export const BreadcrumbsContext = createContext<BreadcrumbsContext | undefined>(
  undefined
);

export const useBreadcrumbsContext = () => {
  const context = useContext(BreadcrumbsContext);
  if (!context) {
    throw new Error(
      "BreadcrumbsItem compound components cannot be rendered outside the Breadcrumbs component"
    );
  }
  return context;
};
