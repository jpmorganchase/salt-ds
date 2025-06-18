import { useControlled } from "@salt-ds/core";
import { useCallback, useMemo } from "react";
import {
  type CollectionItem,
  itemToString as defaultItemToString,
  type SelectHandler,
  type SelectionChangeHandler,
  type SelectionStrategy,
} from "../common-hooks";
import { type ListHookProps, type ListHookResult, useList } from "../list";
import type { DropdownHookProps, DropdownHookResult } from "./dropdownTypes";

const NULL_REF = { current: null };

export interface DropdownListHookProps<Item, Strategy extends SelectionStrategy>
  extends Partial<Omit<DropdownHookProps, "onKeyDown">>,
    Omit<ListHookProps<Item, Strategy>, "containerRef"> {
  itemToString?: (item: Item) => string;
}

export interface DropdownListHookResult<
  Item,
  Selection extends SelectionStrategy,
> extends Partial<ListHookResult<Item, Selection>>,
    Partial<DropdownHookResult> {
  onOpenChange: any;
  triggerLabel?: string;
}

export const useDropdown = <
  Item,
  Selection extends SelectionStrategy = "default",
>({
  collectionHook,
  defaultHighlightedIndex: defaultHighlightedIndexProp,
  defaultIsOpen,
  defaultSelected,
  highlightedIndex: highlightedIndexProp,
  isOpen: isOpenProp,
  itemToString = defaultItemToString,
  onHighlight,
  onOpenChange,
  onSelectionChange,
  onSelect,
  selected,
  selectionStrategy,
}: DropdownListHookProps<Item, Selection>): DropdownListHookResult<
  Item,
  Selection
> => {
  const isMultiSelect =
    selectionStrategy === "multiple" || selectionStrategy === "extended";

  const [isOpen, setIsOpen] = useControlled<boolean>({
    controlled: isOpenProp,
    default: defaultIsOpen ?? false,
    name: "useDropdownList",
  });

  const handleSelectionChange = useCallback<
    SelectionChangeHandler<Item, Selection>
  >(
    (evt, selected) => {
      if (!isMultiSelect) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
      onSelectionChange?.(evt, selected);
    },
    [isMultiSelect, onOpenChange, onSelectionChange],
  );

  const handleSelect = useCallback<SelectHandler<Item>>(
    (evt, selected) => {
      if (!isMultiSelect) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
      onSelect?.(evt, selected);
    },
    [isMultiSelect, onOpenChange, onSelect],
  );

  const listHook = useList<Item, Selection>({
    collectionHook,
    defaultHighlightedIndex:
      (defaultHighlightedIndexProp ?? highlightedIndexProp === undefined)
        ? 0
        : undefined,
    defaultSelected,
    label: "useDropDownList",
    onSelectionChange: handleSelectionChange,
    onSelect: handleSelect,
    containerRef: NULL_REF,
    highlightedIndex: highlightedIndexProp,
    onHighlight,
    selected,
    selectionStrategy,
    tabToSelect: !isMultiSelect,
  });

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  const triggerLabel = useMemo(() => {
    if (isMultiSelect && Array.isArray(listHook.selected)) {
      const selectedItems = listHook.selected as CollectionItem<Item>[];
      if (selectedItems.length === 0) {
        return undefined;
      }
      if (selectedItems.length === 1) {
        const { value } = selectedItems[0];
        return value === null ? undefined : itemToString(value);
      }
      return `${selectedItems.length} items selected`;
    }
    const selectedItem = listHook.selected as CollectionItem<Item>;
    return selectedItem == null || selectedItem.value === null
      ? undefined
      : itemToString(selectedItem.value);
  }, [isMultiSelect, itemToString, listHook.selected]);

  return {
    isOpen,
    onOpenChange: handleOpenChange,
    triggerLabel,
    ...listHook,
  };
};
