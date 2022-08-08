import { HTMLAttributes, RefObject } from "react";
import {
  CollectionHookResult,
  CollectionItem,
  ListHandlers,
  SelectionHookResult,
  SelectionProps,
  SelectionStrategy,
} from "../common-hooks";
import { ListControlProps } from "../list/listTypes";

export interface TreeNode {
  checked?: boolean;
  childNodes?: TreeNode[];
  description?: string;
  expanded?: boolean;
  icon?: string;
  iconSize?: number;
  id: string;
  indeterminate?: boolean;
  name?: string;
  selected?: boolean;
}

export interface TreeProps<T, Selection extends SelectionStrategy>
  extends SelectionProps<T, Selection>,
    Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  disabled?: boolean;
  groupSelection?: string;
  height?: number;
  onHighlight?: () => void;
  onToggle?: (node: T) => void;
  revealSelected?: boolean;
  source?: T[];
  width?: number;
}

export interface TreeHookProps<Item, Selection extends SelectionStrategy>
  extends SelectionProps<CollectionItem<Item>, Selection> {
  collectionHook: CollectionHookResult<Item>;
  containerRef: RefObject<HTMLElement>;
  contentRef?: RefObject<HTMLElement>;
  disabled?: boolean;
  groupSelection?: string;
  onHighlight?: (index: number) => void;
  onToggle?: (node: Item) => void;
}

export interface TreeHookResult<Item, Selection extends SelectionStrategy>
  extends Pick<
    SelectionHookResult<Item, Selection>,
    "selected" | "setSelected"
  > {
  focusVisible: number;
  highlightedIdx: number;
  highlightItemAtIndex: (index: number) => void;
  listHandlers: ListHandlers;
  listProps: ListControlProps;
  listItemHandlers: Pick<ListHandlers, "onClick">;
}
