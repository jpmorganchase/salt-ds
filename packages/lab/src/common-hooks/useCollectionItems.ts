import { isValidElement, useCallback, useMemo, useRef, useState } from "react";
import { useCollection } from "./collectionProvider";
import type {
  CollectionHookProps,
  CollectionHookResult,
  CollectionIndexer,
  CollectionItem,
} from "./collectionTypes";
import { itemToString as defaultItemToString } from "./itemToString";
import type {
  SelectionStrategy,
  SingleSelectionStrategy,
} from "./selectionTypes";
import {
  childItems,
  countChildItems,
  type FilterPredicate,
  getDefaultFilter,
  getDefaultFilterRegex,
  isDisabled,
  isFocusable,
  isGroupNode,
  isHeader,
  isParentPath,
  replaceCollectionItem,
  sourceItems,
} from "./utils";

const defaultCollectionOptions = {};

export const useCollectionItems = <Item>({
  children,
  id: idRoot,
  label: _label = "",
  options = defaultCollectionOptions,
  // revealSelected = false,
  source,
}: CollectionHookProps<Item>): CollectionHookResult<Item> => {
  const { getItemId } = options;

  const [, forceUpdate] = useState<unknown>(null);
  const inheritedCollectionHook = useCollection<Item>();
  const dataRef = useRef<CollectionItem<Item>[]>([]);
  const flattenedDataRef = useRef<CollectionItem<Item>[]>([]);
  const EMPTY_COLLECTION: CollectionItem<Item>[] = useMemo(() => [], []);
  const filterPattern = useRef<string>(options.filterPattern ?? "");

  // destructure individual option values so we can safely reference them in dependency arrays
  const {
    getFilterRegex = getDefaultFilterRegex,
    noChildrenLabel,
    itemToString = defaultItemToString,
  } = options;

  const isExpanded = useCallback(() => {
    // We can't do this here because itemToId won't work until we complete this phase
    // if (Array.isArray(revealSelected)) {
    //   const selectedIds = revealSelected.map(itemToId);
    //   return selectedIds.some((id) => isParentPath(path, id));
    // }
    return options.defaultExpanded || false;
  }, [options.defaultExpanded]);

  const addMetadataToItems = useCallback(
    <Item>(
      items: CollectionItem<Item>[],
      indexer: CollectionIndexer,
      level = 1,
      path = "",
      results: CollectionItem<Item>[] = [],
      flattenedCollection: CollectionItem<Item>[] = [],
      flattenedSource: (Item | null)[] = [],
    ): [CollectionItem<Item>[], (Item | null)[], CollectionItem<Item>[]] => {
      items.forEach((item, i, all) => {
        const isCollapsibleHeader = item.header && options.collapsibleHeaders;
        const isNonCollapsibleGroupNode =
          item.childNodes && options.collapsibleHeaders === false;
        const isLeaf = !item.childNodes || item.childNodes.length === 0;
        const nonCollapsible =
          isNonCollapsibleGroupNode || (isLeaf && !isCollapsibleHeader);
        const childPath = path ? `${path}.${i}` : `item-${i}`;
        // getItemId is backward compatible with earlier List implementation.
        // It is not appropriate for a nested source structure, where index
        // will not always be an absolute offset.
        const id =
          item.id ?? (getItemId ? getItemId(i) : `${idRoot}-${childPath}`);

        const expanded = nonCollapsible
          ? undefined
          : (item.expanded ?? isExpanded());
        //TODO dev time check - if id is provided by user, make sure
        // hierarchical pattern is consistent
        const normalisedItem: CollectionItem<Item> = {
          ...item,
          childNodes: undefined,
          count:
            !isNonCollapsibleGroupNode && expanded === undefined
              ? 0
              : countChildItems(item, all, i),
          description: item.description,
          disabled: isDisabled(item.value),
          focusable: isFocusable(item.value) ? undefined : false,
          id,
          index: indexer.value,
          expanded,
          level,
        };
        results.push(normalisedItem);
        flattenedCollection.push(normalisedItem);
        flattenedSource.push(items[i].value);

        indexer.value += 1;

        // if ((isNonCollapsibleGroupNode || expanded !== undefined) && !isCollapsibleHeader) {
        if (item.childNodes) {
          const [children] = addMetadataToItems<Item>(
            item.childNodes,
            indexer,
            level + 1,
            childPath,
            [],
            flattenedCollection,
            flattenedSource,
          );
          normalisedItem.childNodes = children;
        }
      });
      return [results, flattenedSource, flattenedCollection];
    },
    [options.collapsibleHeaders, getItemId, idRoot, isExpanded],
  );

  const getFilter = useCallback(() => {
    if (filterPattern.current) {
      return getDefaultFilter(filterPattern.current, getFilterRegex);
    }
    return null;
  }, [getFilterRegex]);

  const collectVisibleItems = useCallback(
    (
      items: CollectionItem<Item>[],
      filter: null | FilterPredicate = getFilter(),
      results: CollectionItem<Item>[] = [],
      idx: { value: number } = { value: 0 },
    ): CollectionItem<Item>[] => {
      let skipToNextHeader = false;
      for (const item of items) {
        if (!(skipToNextHeader && !isHeader(item))) {
          if (
            item.value !== null &&
            (filter === null || filter(itemToString(item.value)))
          ) {
            results[idx.value] = item;
            idx.value += 1;
          }
          skipToNextHeader = false;
          if (isHeader(item) && item.expanded === false) {
            skipToNextHeader = true;
          } else if (isGroupNode(item)) {
            if (item.expanded !== false && item.childNodes) {
              collectVisibleItems(item.childNodes, filter, results, idx);
            }
          }
        }
      }
      return results;
    },
    [getFilter, itemToString],
  );

  // Stage 1 - convert source or children to CollectionItems.
  const partialCollectionItems = useMemo(() => {
    return inheritedCollectionHook
      ? EMPTY_COLLECTION
      : sourceItems<Item>(source, { itemToString, noChildrenLabel }) ||
          childItems(children) ||
          [];
  }, [
    inheritedCollectionHook,
    EMPTY_COLLECTION,
    source,
    itemToString,
    noChildrenLabel,
    children,
  ]);

  // Stage 2 - extend the collectionItems with additional metadata
  const [collectionItems, flattenedSource, flattenedCollection] = useMemo(
    () =>
      inheritedCollectionHook
        ? [EMPTY_COLLECTION, EMPTY_COLLECTION, EMPTY_COLLECTION]
        : //@ts-ignore
          addMetadataToItems<Item>(partialCollectionItems, { value: 0 }),
    [
      EMPTY_COLLECTION,
      addMetadataToItems,
      inheritedCollectionHook,
      partialCollectionItems,
    ],
  );
  flattenedDataRef.current = flattenedCollection;

  // Stage 3 prepare the list of visible items, this is what will be rendered
  useMemo(
    () =>
      inheritedCollectionHook
        ? EMPTY_COLLECTION
        : (dataRef.current = collectVisibleItems(collectionItems)),
    [
      EMPTY_COLLECTION,
      collectVisibleItems,
      collectionItems,
      inheritedCollectionHook,
    ],
  );

  const collectionItemsRef = useRef(collectionItems);

  const setFilterPattern = useCallback(
    (pattern = "") => {
      if (typeof pattern === "string") {
        filterPattern.current = pattern;
        dataRef.current = collectVisibleItems(collectionItems);
        forceUpdate({});
      }
    },
    [collectionItems, collectVisibleItems],
  );

  const itemById = useCallback(
    (
      id: string,
      target: CollectionItem<Item>[] = collectionItems,
    ): Item | never => {
      const sourceWithId = target.find(
        (i) => i.id === id || (i?.childNodes?.length && isParentPath(i.id, id)),
      );
      if (sourceWithId?.id === id && sourceWithId.index != null) {
        //TODO do we need the flattered source at all ?
        return flattenedSource?.[sourceWithId.index] as Item;
      }
      if (sourceWithId) {
        return itemById(id, sourceWithId.childNodes);
      }
      throw Error(`useCollectionData itemById, id ${id} not found `);
    },
    [flattenedSource, collectionItems],
  );

  const toCollectionItem = useCallback(
    (item: Item): CollectionItem<Item> | never => {
      // TODO what about Tree structures, we need to search flattened source
      const collectionItem = flattenedDataRef.current.find((i) =>
        // const collectionItem = collectionItemsRef.current.find((i) =>
        isValidElement(i.value) ? i.label === item : i.value === item,
      );
      if (collectionItem) {
        return collectionItem;
      }
      throw Error("useCollectionData toCollectionItem, item not found ");
    },
    [],
  );

  // TODO types need more work, these are correct but we
  // don't really want references to Selection in here
  const itemToCollectionItem = useCallback(
    <
      Selection extends SelectionStrategy,
      U extends Item | Item[] | null | undefined,
    >(
      sel: U,
    ): Selection extends SingleSelectionStrategy
      ? CollectionItem<Item> | null
      : CollectionItem<Item>[] => {
      type returnType = Selection extends SingleSelectionStrategy
        ? CollectionItem<Item> | null
        : CollectionItem<Item>[];

      if (sel === null) {
        return null as returnType;
      }
      if (Array.isArray(sel)) {
        const result: CollectionItem<Item>[] = [];
        for (const item of sel) {
          const collectionItem = toCollectionItem(item);
          result.push(collectionItem);
        }
        return result as returnType;
      }
      if (sel !== undefined) {
        return toCollectionItem(sel as Item) as returnType;
      }

      return undefined as unknown as returnType;
    },
    [toCollectionItem],
  );

  const stringToCollectionItem = useCallback(
    <Selection extends SelectionStrategy>(
      value: string | null | undefined,
    ): Selection extends SingleSelectionStrategy
      ? CollectionItem<Item> | null
      : CollectionItem<Item>[] => {
      type returnType = Selection extends SingleSelectionStrategy
        ? CollectionItem<Item> | null
        : CollectionItem<Item>[];

      const toCollectionItem = (
        item: string,
      ): undefined | CollectionItem<Item> | never => {
        // TODO what about Tree structures, we need to search flattened source
        const collectionItem = flattenedDataRef.current.find((i) =>
          // const collectionItem = collectionItemsRef.current.find((i) =>
          isValidElement(i.value)
            ? i.label === item
            : i.value !== null && itemToString(i.value) === item,
        );
        if (collectionItem) {
          return collectionItem;
        }
      };

      if (value === null) {
        return null as returnType;
      }
      if (Array.isArray(value)) {
        const result: CollectionItem<Item>[] = [];
        for (const item of value) {
          const collectionItem = toCollectionItem(item);
          if (collectionItem) {
            result.push(collectionItem);
          }
        }
        return result as returnType;
      }
      if (value !== undefined) {
        return toCollectionItem(value) as returnType;
      }

      return undefined as unknown as returnType;
    },
    [itemToString],
  );

  const itemToId = useCallback((item: Item): string => {
    for (const collectionItem of collectionItemsRef.current) {
      if (item === collectionItem.value) {
        return collectionItem.id;
      }
    }
    throw Error("useCollectionData itemToId, item not found");
  }, []);

  const collapseGroupItem = useCallback(
    (item: CollectionItem<Item>) => {
      collectionItemsRef.current = replaceCollectionItem(
        collectionItemsRef.current,
        item.id,
        {
          expanded: false,
        },
      );
      dataRef.current = collectVisibleItems(collectionItemsRef.current);
      forceUpdate({});
    },
    [collectVisibleItems],
  );

  const expandGroupItem = useCallback(
    (item: CollectionItem<Item>) => {
      collectionItemsRef.current = replaceCollectionItem<Item>(
        collectionItemsRef.current,
        item.id,
        {
          expanded: true,
        },
      );
      dataRef.current = collectVisibleItems(collectionItemsRef.current);
      forceUpdate({});
    },
    [collectVisibleItems],
  );

  return (
    inheritedCollectionHook || {
      collapseGroupItem,
      data: dataRef.current,
      expandGroupItem, // why not toggle, or just rely on setdata ?
      setFilterPattern,
      itemById,
      itemToId,
      toCollectionItem,
      itemToCollectionItem,
      stringToCollectionItem,
    }
  );
};
