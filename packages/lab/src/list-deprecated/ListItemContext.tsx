import { createContext, useContext, Context } from "react";

export interface ListItemContextProps<Item> {
  disableMouseDown?: boolean;
  getItemId: (index: number) => string;
  getItemHeight?: (index?: number) => number | string;
  itemToString: (item: Item) => string;
  itemTextHighlightPattern?: RegExp | string;
}

export type ListItemContextType<Item> = Context<ListItemContextProps<Item>>;

export const ListItemContext = createContext<
  ListItemContextProps<unknown> | undefined
>(undefined);

export const useListItemContext = function <
  Item
>(): ListItemContextProps<Item> {
  const contextValue = useContext(ListItemContext);

  if (contextValue === undefined) {
    throw new Error(
      "useListItemContext must be used inside of a List or ListBase component."
    );
  }

  return contextValue;
};
