import { useEffect, useMemo, useCallback, MouseEvent } from "react";
import { ListChildComponentProps } from "react-window";

import { ListItemProps } from "./ListItem";
import { ListItemBaseProps } from "./ListItemBase";

import { useListStateContext } from "./ListStateContext";
import { useListItemContext } from "./ListItemContext";

type UseItemHookReturnType<Item> = {
  /**
   * Item data
   */
  item: Item;
  /**
   * Utility function for converting item data to a string
   */
  itemToString: (item: Item) => string;
  /**
   * Properties applied to a basic list item component
   */
  itemProps: ListItemBaseProps;
};

export interface IndexedListItemProps<Item> extends ListItemProps<Item> {
  ariaProps?: {
    role?: string;
    "aria-disabled"?: string;
    "aria-checked"?: string;
    "aria-posinset"?: number;
    "aria-setsize"?: number;
  };

  index: number;
  itemHeight?: number | string;
}

export function useListItem<Item>(
  props: IndexedListItemProps<Item>
): UseItemHookReturnType<Item> {
  validateProps(props);

  const context = useListItemContext<Item>();
  const { state, helpers } = useListStateContext();
  const { setHighlightedIndex, setFocusVisible, handleSelect } = helpers;
  const {
    focusVisible,
    highlightedIndex,
    selectedItem,
    isDeselectable,
    isDisabled,
    isMultiSelect,
  } = state;
  const {
    index,
    item,
    onClick,
    onMouseDown,
    onMouseMove,
    id = context.getItemId(index),
    itemHeight = context.getItemHeight?.(index),
    itemToString = context.itemToString,
    itemTextHighlightPattern = context.itemTextHighlightPattern,
    // An item can be disabled by
    // 1. Setting disabled attribute on the item object, or
    // 2. Passing a disabled prop directly or
    // 3. Using the disabled state in list context
    //TODO Not sure where disabled needs to be defined
    disabled = (item as any).disabled || isDisabled,
    ariaProps: ariaPropsProp,
    style: styleProp,
    ...restProps
  } = props;

  const style = useMemo(
    () => ({
      height: itemHeight,
      ...styleProp,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemHeight, JSON.stringify(styleProp)]
  );

  const highlighted = index === highlightedIndex;
  const selected = isMultiSelect
    ? selectedItem.indexOf(item) !== -1
    : item === selectedItem;

  const handleClick = useCallback(
    (event) => {
      console.log("handleClick");
      handleSelect(event, index, item);

      if (onClick) {
        onClick(event);
      }
    },
    [handleSelect, index, item, onClick]
  );

  const handleMouseMove = useCallback(
    (event) => {
      setHighlightedIndex(index);
      setFocusVisible(false);

      if (onMouseMove) {
        onMouseMove(event);
      }
    },
    [index, setFocusVisible, setHighlightedIndex, onMouseMove]
  );

  const handleMouseDown = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    if (context.disableMouseDown) {
      event.preventDefault();
    } else if (onMouseDown) {
      onMouseDown(event);
    }
  };

  const eventHandlers = {
    onClick: handleClick,
    onMouseMove: handleMouseMove,
    onMouseDown: handleMouseDown,
  };

  const ariaProps = {
    role: "option",
    ...(disabled && { "aria-disabled": true }),
    ...ariaPropsProp,
  };

  if (selected) {
    ariaProps[`${isMultiSelect ? "aria-selected" : "aria-checked"}`] = true;
  }

  return {
    item: item!,
    itemToString,
    itemProps: {
      "data-option-index": index,
      id,
      style,
      deselectable: isDeselectable || isMultiSelect,
      disabled,
      selected,
      highlighted,
      itemTextHighlightPattern,
      focusVisible: focusVisible && highlighted,
      tooltipText: itemToString(item!),
      ...ariaProps,
      ...restProps,
      ...(disabled ? {} : eventHandlers),
    },
  };
}

type VirtualizedListItemProps = Pick<
  ListChildComponentProps,
  "index" | "style" | "data"
>;

export const useVirtualizedListItem = (props: VirtualizedListItemProps) => {
  const { index, data, style = {} } = props;
  // Filter out inline width added by `react-window` so that it can only be defined using css.
  const { width: _unusedWidth, height: itemHeight, ...restStyle } = style;

  return useListItem({
    index,
    itemHeight,
    style: restStyle,
    item: data[index],
    ariaProps: {
      "aria-posinset": index + 1,
      "aria-setsize": data.length,
    },
  });
};

const validateProps = <Item>(props: IndexedListItemProps<Item>) => {
  const { index, item } = props;

  /* eslint-disable react-hooks/rules-of-hooks */
  useEffect(() => {
    if (item === undefined) {
      console.warn("useListItem needs `item`.");
    }
    if (index === undefined) {
      console.warn("useListItem needs to know item's index.");
    }
  }, [index, item]);
  /* eslint-enable react-hooks/rules-of-hooks */
};
