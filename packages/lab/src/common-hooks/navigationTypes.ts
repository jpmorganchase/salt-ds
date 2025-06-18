import type { FocusEvent, KeyboardEvent, RefObject } from "react";
import type { CollectionItem } from "./collectionTypes";
import type {
  SelectionStrategy,
  SingleSelectionStrategy,
} from "./selectionTypes";

export interface NavigationProps<Item = unknown> {
  cycleFocus?: boolean;
  defaultHighlightedIndex?: number;
  disableHighlightOnFocus?: boolean;
  focusOnHighlight?: boolean;
  focusVisible?: number;
  highlightedIndex?: number;
  indexPositions: CollectionItem<Item>[];
  onHighlight?: (idx: number) => void;
  onKeyboardNavigation?: (evt: KeyboardEvent<HTMLElement>, idx: number) => void;
  restoreLastFocus?: boolean;
}

export interface NavigationHookProps<Item, Selection extends SelectionStrategy>
  extends NavigationProps<Item> {
  containerRef: RefObject<HTMLElement>;
  label?: string;
  selected?: Selection extends SingleSelectionStrategy
    ? CollectionItem<Item> | null
    : CollectionItem<Item>[];
}

export interface KeyboardHookListProps {
  onBlur: (evt: FocusEvent<HTMLElement>) => void;
  onFocus: (evt: FocusEvent<HTMLElement>) => void;
  onKeyDown: (evt: KeyboardEvent<HTMLElement>) => void;
  onMouseDownCapture: () => void;
  onMouseMove: () => void;
  onMouseLeave: () => void;
}

export interface NavigationHookResult {
  focusVisible: number;
  controlledHighlighting: boolean;
  highlightedIndex: number;
  setHighlightedIndex: (idx: number) => void;
  keyboardNavigation: RefObject<boolean>;
  listProps: KeyboardHookListProps;
  setIgnoreFocus: (ignoreFocus: boolean) => void;
}
