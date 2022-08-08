import { cloneElement, createContext, ReactElement, useContext } from "react";
import { CollectionHookResult } from "./collectionTypes";

export interface collectionContext<T> {
  collection: CollectionHookResult<T>;
}

export const CollectionContext = createContext<
  CollectionHookResult<any> | undefined
>(undefined);

interface ContextProviderProps<Item> {
  children: ReactElement;
  collectionHook: CollectionHookResult<Item>;
}

export function CollectionProvider<Item>({
  children,
  collectionHook,
  ...props
}: ContextProviderProps<Item>) {
  return (
    <CollectionContext.Provider value={collectionHook}>
      {Object.keys(props).length > 0 ? cloneElement(children, props) : children}
    </CollectionContext.Provider>
  );
}

export function useCollection<Item>(): CollectionHookResult<Item> | undefined {
  const collection = useContext(CollectionContext);
  if (collection) {
    return collection as CollectionHookResult<Item>;
  }
}
