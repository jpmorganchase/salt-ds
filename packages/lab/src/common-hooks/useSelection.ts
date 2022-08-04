import { useControlled } from "@jpmorganchase/uitk-core";
import { KeyboardEvent, MouseEvent, useCallback, useRef } from "react";
import { CollectionItem } from "./collectionTypes";
import {
  SelectionHookProps,
  SelectionHookResult,
  SelectionStrategy,
  SingleSelectionStrategy,
} from "./selectionTypes";

export const CHECKBOX = "checkbox";

export const GROUP_SELECTION_NONE = "none";
export const GROUP_SELECTION_SINGLE = "single";
export const GROUP_SELECTION_CASCADE = "cascade";

export type GroupSelectionMode = "none" | "single" | "cascade";

const defaultSelectionKeys = ["Enter", " "];

const isSelectable = (item?: CollectionItem<unknown>) =>
  item && item.disabled !== true && item.selectable !== false;

const byItemIndex = (
  i1: CollectionItem<unknown>,
  i2: CollectionItem<unknown>
) => (i1.index ?? 0) - (i2.index ?? 0);

export const groupSelectionEnabled = (
  groupSelection: GroupSelectionMode
): boolean => groupSelection && groupSelection !== GROUP_SELECTION_NONE;

export const useSelection = <
  Item,
  Selection extends SelectionStrategy = "default"
>({
  defaultSelected,
  disableSelection = false,
  // groupSelection = GROUP_SELECTION_NONE,
  highlightedIdx,
  indexPositions,
  label = "",
  onSelect,
  onSelectionChange,
  selected: selectedProp,
  selectionStrategy,
  selectionKeys = defaultSelectionKeys,
  tabToSelect,
}: SelectionHookProps<Item, Selection>): SelectionHookResult<
  Item,
  Selection
> => {
  type collectionItem = CollectionItem<Item>;

  const isDeselectable = selectionStrategy === "deselectable";
  const isMultipleSelect = selectionStrategy === "multiple";
  const isExtendedSelect = selectionStrategy === "extended";

  const lastActive = useRef(-1);

  const isSelectionEvent = useCallback(
    (evt: KeyboardEvent) => selectionKeys.includes(evt.key),
    [selectionKeys]
  );

  const emptyValue = useCallback(<
    Item
  >(): Selection extends SingleSelectionStrategy
    ? null
    : CollectionItem<Item>[] => {
    type returnType = Selection extends SingleSelectionStrategy
      ? null
      : CollectionItem<Item>[];
    return isMultipleSelect || isExtendedSelect
      ? ([] as unknown as returnType)
      : (null as returnType);
  }, [isMultipleSelect, isExtendedSelect]);

  const [selected, setSelected] = useControlled<
    Selection extends SingleSelectionStrategy
      ? CollectionItem<Item> | null
      : CollectionItem<Item>[]
  >({
    controlled: selectedProp,
    default: defaultSelected ?? emptyValue(),
    name: "UseSelection",
    state: "selected",
  });

  const isItemSelected = useCallback(
    (item) => {
      return Array.isArray(selected)
        ? selected.includes(item)
        : selected === item;
    },
    [selected]
  );

  const selectDefault = useCallback((item: collectionItem) => item, []);
  const selectDeselectable = useCallback(
    (item: collectionItem) => (isItemSelected(item) ? null : item),
    [isItemSelected]
  );
  const selectMultiple = useCallback(
    (item: collectionItem) => {
      const nextItems = isItemSelected(item)
        ? (selected as collectionItem[]).filter((i) => i !== item)
        : (selected as collectionItem[]).concat(item);
      nextItems.sort(byItemIndex);
      return nextItems;
    },
    [isItemSelected, selected]
  );
  const selectRange = useCallback(
    (idx: number, preserveExistingSelection) => {
      const currentSelection = preserveExistingSelection
        ? (selected as collectionItem[])
        : ([] as collectionItem[]);

      const [lastSelectedItem] = (selected as collectionItem[]).slice(-1);
      const lastSelectedItemIndex = lastSelectedItem
        ? indexPositions.indexOf(lastSelectedItem)
        : 0;

      const startRegion = Math.min(idx, lastSelectedItemIndex);
      const endRegion = Math.max(idx, lastSelectedItemIndex);
      const rangeSelection = indexPositions.slice(startRegion, endRegion + 1);
      // concat the current selection with a new selection and remove duplicates for overlaps
      const nextItems = [...new Set([...currentSelection, ...rangeSelection])];
      nextItems.sort(byItemIndex);
      return nextItems;
    },
    [indexPositions, selected]
  );

  const selectItemAtIndex = useCallback(
    (
      evt: any,
      idx: number,
      item: collectionItem,
      rangeSelect: boolean,
      preserveExistingSelection?: boolean
    ) => {
      type returnType = Selection extends SingleSelectionStrategy
        ? CollectionItem<Item> | null
        : CollectionItem<Item>[];
      let newSelected: returnType;
      if (isMultipleSelect) {
        newSelected = selectMultiple(item) as returnType;
      } else if (isExtendedSelect) {
        if (preserveExistingSelection && !rangeSelect) {
          newSelected = selectMultiple(item) as returnType;
        } else if (rangeSelect) {
          newSelected = selectRange(
            idx,
            preserveExistingSelection
          ) as returnType;
        } else {
          newSelected = [item] as returnType;
        }
      } else if (isDeselectable) {
        newSelected = selectDeselectable(item) as returnType;
      } else {
        newSelected = selectDefault(item) as returnType;
      }

      if (newSelected !== selected) {
        setSelected(newSelected);
      }

      // We fire onSelect irrespective of whether selection changes
      onSelect?.(evt, item);

      if (newSelected !== selected) {
        if (onSelectionChange) {
          onSelectionChange(evt, newSelected);
        }
      }
    },
    [
      isMultipleSelect,
      isExtendedSelect,
      isDeselectable,
      selected,
      onSelect,
      selectMultiple,
      selectRange,
      selectDeselectable,
      selectDefault,
      setSelected,
      onSelectionChange,
    ]
  );

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      const item = indexPositions[highlightedIdx];
      if (isSelectable(item)) {
        if (isSelectionEvent(evt) || (tabToSelect && evt.key === "Tab")) {
          // We do not inhibit Tab behaviour, if we are selecting on Tab then we apply
          // selection as a side effect of the Tab, not as a replacement for Tabbing.
          if (evt.key !== "Tab") {
            evt.preventDefault();
          }
          selectItemAtIndex(
            evt,
            highlightedIdx,
            item,
            false,
            evt.ctrlKey || evt.metaKey
          );
          if (isExtendedSelect) {
            lastActive.current = highlightedIdx;
          }
        }
      }
    },
    [
      indexPositions,
      highlightedIdx,
      isSelectionEvent,
      tabToSelect,
      selectItemAtIndex,
      isExtendedSelect,
    ]
  );

  const handleKeyboardNavigation = useCallback(
    (evt: React.KeyboardEvent, currentIndex: number) => {
      if (isExtendedSelect && evt.shiftKey) {
        const item = indexPositions[currentIndex];
        if (isSelectable(item)) {
          selectItemAtIndex(evt, currentIndex, item, true);
        }
      }
    },
    [isExtendedSelect, indexPositions, selectItemAtIndex]
  );

  const handleClick = useCallback(
    (evt: MouseEvent) => {
      const item = indexPositions[highlightedIdx];
      if (!disableSelection && isSelectable(item)) {
        // if (!isCollapsibleItem(item)) {
        evt.preventDefault();
        evt.stopPropagation();
        selectItemAtIndex(
          evt,
          highlightedIdx,
          item,
          evt.shiftKey,
          evt.ctrlKey || evt.metaKey
        );
        if (isExtendedSelect) {
          lastActive.current = highlightedIdx;
        }
        // }
      }
    },
    [
      disableSelection,
      isExtendedSelect,
      highlightedIdx,
      indexPositions,
      selectItemAtIndex,
    ]
  );

  const listHandlers = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onKeyboardNavigation: handleKeyboardNavigation,
  };

  return {
    listHandlers,
    selected,
    setSelected,
  };
};
