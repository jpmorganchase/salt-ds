import { SyntheticEvent } from "react";
import { CollectionItem } from "./collectionTypes";

export const SINGLE = "default";
export const MULTIPLE = "multiple";
export const EXTENDED = "extended";
export const DESELECTABLE = "deselectable";

// export type SelectionDisallowed = "none";
export type SingleSelectionStrategy = "default" | "deselectable";
export type MultiSelectionStrategy =
  | "multiple"
  | "extended"
  | "extended-multi-range";
export type SelectionStrategy =
  // | SelectionDisallowed
  SingleSelectionStrategy | MultiSelectionStrategy;

export type selectedType<
  Item,
  Selection extends SelectionStrategy
> = Selection extends MultiSelectionStrategy ? Item[] : Item | null;

export type SelectHandler<Item = string> = (
  event: SyntheticEvent,
  selectedItem: Item
) => void;

export type SelectionChangeHandler<
  Item = string,
  Selection extends SelectionStrategy = "default"
> = (
  event: SyntheticEvent,
  selected: Selection extends SingleSelectionStrategy ? Item | null : Item[]
) => void;

export const hasSelection = <Item = unknown>(
  selected: Item | Item[] | null
): boolean => {
  return Array.isArray(selected)
    ? selected.length > 0
    : selected !== null && selected !== undefined;
};

export const getFirstSelectedItem = <Item = unknown>(
  selected: Item | Item[] | null
): Item | null => {
  return Array.isArray(selected) ? selected[0] : selected;
};

export interface SelectionProps<
  Item,
  Selection extends SelectionStrategy = "default"
> {
  defaultSelected?: Selection extends SingleSelectionStrategy
    ? Item | null
    : Item[];
  onSelect?: SelectHandler<Item>;
  onSelectionChange?: SelectionChangeHandler<Item, Selection>;
  selected?: Selection extends SingleSelectionStrategy ? Item | null : Item[];
  selectionStrategy?: Selection;
}

export interface ListHandlers {
  onClick?: (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyboardNavigation?: (
    event: React.KeyboardEvent,
    currentIndex: number
  ) => void;
  onMouseMove?: (event: React.MouseEvent) => void;
}
export interface SelectionHookProps<
  Item,
  Selection extends SelectionStrategy = "default"
> extends SelectionProps<CollectionItem<Item>, Selection> {
  disableSelection?: boolean;
  highlightedIdx: number;
  indexPositions: CollectionItem<Item>[];
  label?: string;
  selectionKeys?: string[];
  tabToSelect?: boolean;
}

export interface SelectionHookResult<
  Item,
  Selection extends SelectionStrategy = "default"
> {
  listHandlers: ListHandlers;
  selected: Selection extends SingleSelectionStrategy
    ? CollectionItem<Item> | null
    : CollectionItem<Item>[];
  setSelected: (
    selected: Selection extends SingleSelectionStrategy
      ? CollectionItem<Item> | null
      : CollectionItem<Item>[]
  ) => void;
}
