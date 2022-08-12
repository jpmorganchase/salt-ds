import { TooltipContextProps } from "@jpmorganchase/uitk-core";
import { HTMLAttributes, Ref, SyntheticEvent } from "react";

export type ListSingleSelectionVariant = "default" | "deselectable";
export type ListMultiSelectionVariant = "multiple" | "extended";
export type ListSelectionVariant =
  | ListSingleSelectionVariant
  | ListMultiSelectionVariant;

export type ListChangeHandler<
  Item = string,
  Variant extends ListSelectionVariant = "default"
> = (
  event: SyntheticEvent,
  item: null | (Variant extends ListMultiSelectionVariant ? Array<Item> : Item)
) => void;

export type ListSelectHandler<Item = string> = (
  event: SyntheticEvent,
  item: Item | null
) => void;

export interface ListBaseProps<Item = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "onSelect"> {
  /**
   * The component used for item instead of the default.
   */
  ListItem?: any;
  /**
   * The component used when there are no items.
   */
  ListPlaceholder?: any;
  /**
   * If `true`, the component will have no border.
   */
  borderless?: boolean;
  /**
   * If `true`, the component will not receive focus.
   *
   * Useful when list is used with other components to form a tightly coupled atomic component where
   * other components should receive focus instead. For instance, when used with an input to form a
   * combo box the list should not be focused, the input should receive focus instead.
   */
  disableFocus?: boolean;
  /**
   * If `true`, the component will prevent mousedown event from firing.
   *
   * Useful when list is used with other components to form a tightly coupled atomic component where
   * a click/select on list should not cause the focus to blur away from the current active element.
   */
  disableMouseDown?: boolean;
  /**
   * If `true`, the component will be disabled.
   */
  disabled?: boolean;
  /**
   * The number of items displayed in the visible area.
   *
   * Note that this determines the max height of the list if the list height is not set to 100%.
   */
  displayedItemCount?: number;
  /**
   * The indexer function used when there is no source. It should return a number.
   *
   * @param {number} index The item index.
   */
  getItemAtIndex?: (index: number) => Item;
  /**
   * Used for providing customized item height. It should return a number or a string if item height
   * is in percentage. When used with `virtualized` prop a variable-height list will be rendered instead
   * of a fixed-height one.
   *
   * @param {number} index The item index.
   */
  getItemHeight?: (index?: number) => number;
  /**
   * Used for providing customized item ids.
   *
   * @param {number} index The item index.
   */
  getItemId?: (index: number) => string;
  /**
   * The function for getting item's index.
   *
   * @param {object} item The item.
   */
  getItemIndex?: (item: Item) => number;
  /**
   * Height of the component.
   */
  height?: number | string;
  /**
   * The total number of items.
   *
   * Used for keyboard navigation (when `End` key is pressed) and when the list is virtualized.
   */
  itemCount?: number;
  /**
   * Size of the gap between list items.
   */
  itemGapSize?: number;
  /**
   * Height of an item. I can be a number or a string if item height is in percentage. If omitted
   * default height values from Toolkit theme will be used.
   *
   * Note that when using a percentage value, the list must have a height.
   */
  itemHeight?: number | string;
  /**
   * Used for providing text highlight.
   *
   * It can be a capturing regex or a string for a straightforward string matching.
   */
  itemTextHighlightPattern?: RegExp | string;
  /**
   * Item `toString` function when list is not used declaratively and its items are objects
   * instead of strings. The string value is also used in tooltip when item text is truncated.
   *
   * If omitted, component will look for a `label` property on the data object.
   *
   * @param {object} item The item.
   */
  itemToString?: (item: Item) => string;
  /**
   * Used for accessing the scrollable list node inside of the component. If you want to access
   * the outer wrapper node use `ref` instead.
   */
  listRef?: Ref<HTMLElement>;
  /**
   * Maximum list height.
   */
  maxHeight?: number | string;
  /**
   * Maximum list width.
   */
  maxWidth?: number | string;
  /**
   * Minimum list height.
   */
  minHeight?: number | string;
  /**
   * Minimum list width.
   */
  minWidth?: number | string;
  /**
   * @external - react-window
   *
   * The number of items to render outside of the visible area.
   */
  overscanCount?: number;
  /**
   * If `true`, the component will remember the last keyboard-interacted position
   * and highlight it when list is focused again.
   */
  restoreLastFocus?: boolean;
  /**
   * Data source used. It should be an array of objects or strings.
   */
  source?: ReadonlyArray<Item>;
  /**
   * @external - react-window
   *
   * If `true`, list will be virtualized.
   * @see https://github.com/bvaughn/react-window
   */
  virtualized?: boolean;
  /**
   * Width of the component.
   */
  width?: number | string;
}

export interface ListProps<
  Item = string,
  Variant extends ListSelectionVariant = "default"
> extends ListBaseProps<Item> {
  Tooltip?: TooltipContextProps["Tooltip"];
  disableTypeToSelect?: boolean;
  getItemIndex?: (item: Item) => number;
  highlightedIndex?: number;
  initialSelectedItem?: Variant extends ListMultiSelectionVariant
    ? Array<Item>
    : Item;
  onChange?: ListChangeHandler<Item, Variant>;
  onSelect?: ListSelectHandler<Item>;
  selectedItem?: Variant extends ListMultiSelectionVariant ? Array<Item> : Item;
  selectionVariant?: Variant;
  /**
   * When set to `true`, 'Tab' key selects current highlighted item before focus is blurred away
   * from the component. This would be the desirable behaviour for any dropdown menu based
   * components like dropdown, combobox.
   *
   * @default false
   */
  tabToSelect?: boolean;
  tooltipEnterDelay?: TooltipContextProps["enterDelay"];
  tooltipLeaveDelay?: TooltipContextProps["leaveDelay"];
  tooltipPlacement?: TooltipContextProps["placement"];
}
