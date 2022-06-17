import {
  ownerDocument,
  useControlled,
  useForkRef,
  useId,
} from "@jpmorganchase/uitk-core";
import {
  AriaAttributes,
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEvent,
  Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import warning from "warning";
import { useIsFocusVisible } from "../utils";
import {
  ListMultiSelectionVariant,
  ListProps,
  ListSelectionVariant,
} from "./ListProps";

type keyHandler = (event: KeyboardEvent<HTMLInputElement>) => void;

interface listBoxAriaProps
  extends Pick<
    AriaAttributes,
    "aria-activedescendant" | "aria-multiselectable"
  > {
  role: string; // We will default it to be 'listbox', but users can override
}
export interface ListState<
  Item = "string",
  Variant extends ListSelectionVariant = "default"
> {
  id: string;
  focusVisible: boolean;
  selectedItem?: Variant extends ListMultiSelectionVariant ? Array<Item> : Item;
  highlightedIndex?: number;
  isDeselectable: boolean;
  isMultiSelect: boolean;
  isDisabled: boolean;
}

export interface ListHelpers<
  Item = "string",
  Variant extends ListSelectionVariant = "default"
> {
  setFocusVisible: (visible: boolean) => void;
  setSelectedItem: (
    selectedItem?: Variant extends ListMultiSelectionVariant
      ? Array<Item>
      : Item
  ) => void;
  setHighlightedIndex: (highlightedIndex?: number) => void;
  handleSelect: (
    event: ChangeEvent<Element>,
    index: number,
    item: Item
  ) => void;
  keyDownHandlers: { [key: string]: KeyboardEventHandler };
  // TODO: Form Field
}

export function useList<Item, Variant extends ListSelectionVariant>(
  props: ListProps<Item, Variant> = {}
): {
  focusedRef: Ref<any>;
  listProps: Partial<ListProps<Item, Variant>> & listBoxAriaProps;
  state: ListState<Item, Variant>;
  helpers: ListHelpers<Item, Variant>;
} {
  validateProps(props);

  const generatedId = useId(props.id);

  const {
    id = generatedId,
    source = [],
    itemCount = source.length,
    getItemId = (index) => `${id}-item-${index}`,
    getItemAtIndex: getItemAtIndexProp,
    getItemIndex: getItemIndexProp,
    displayedItemCount = 10,
    initialSelectedItem,
    selectionVariant,
    disabled = false,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    onMouseDown,
    onMouseLeave,
    onSelect,
    disableMouseDown,
    restoreLastFocus,
    highlightedIndex: highlightedIndexProp,
    selectedItem: selectedItemProp,
    tabToSelect,
    ...restProps
  } = props;

  const {
    isFocusVisibleRef,
    onFocus: handleFocusVisible,
    onBlur: handleBlurVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible();

  const { current: isDeselectable } = useRef(
    selectionVariant === "deselectable"
  );
  const { current: isMultiSelect } = useRef(
    selectionVariant === "multiple" ||
      selectionVariant === "extended" ||
      Array.isArray(initialSelectedItem) ||
      Array.isArray(selectedItemProp)
  );

  const { current: isExtendedSelect } = useRef(selectionVariant === "extended");

  let getItemIndex = useCallback((item) => source.indexOf(item), [source]);
  let getItemAtIndex = useCallback((index) => source[index], [source]);

  const indexComparator = useCallback(
    (a, b) => getItemIndex(a) - getItemIndex(b),
    [getItemIndex]
  );

  // Only use getItemIndex and getItemAtIndex if both are defined; otherwise keep the defaults
  if (
    typeof getItemIndexProp === "function" &&
    typeof getItemAtIndexProp === "function"
  ) {
    getItemIndex = getItemIndexProp;
    getItemAtIndex = getItemAtIndexProp;
  }

  const rootRef = useRef();
  const [focusVisible, setFocusVisible] = useState(false);
  const [lastFocusedIndex, setLastFocusedIndex] = useState(-1);

  const [selectedItem, setSelectedItem] = useControlled<
    (Variant extends ListMultiSelectionVariant ? Item[] : Item) | undefined
  >({
    controlled: selectedItemProp,
    default:
      initialSelectedItem ??
      ((isMultiSelect
        ? []
        : null) as unknown as Variant extends ListMultiSelectionVariant
        ? Item[]
        : Item),
    name: "useList",
    state: "selectedItem",
  });

  const [highlightedIndex, setHighlightedIndex] = useControlled<
    number | undefined
  >({
    controlled: highlightedIndexProp,
    default: undefined,
    name: "useList",
    state: "highlightedIndex",
  });

  const handleSingleSelect = useCallback(
    (event, index, item) => {
      const isSelected = item === selectedItem;
      let nextItem;

      if (isSelected && !isDeselectable) {
        return;
      }

      if (!isSelected) {
        nextItem = item;
        setHighlightedIndex(index);
      } else {
        nextItem = null;
      }

      setSelectedItem(nextItem);

      if (onChange) {
        onChange(event, nextItem);
      }
    },
    [
      isDeselectable,
      onChange,
      selectedItem,
      setHighlightedIndex,
      setSelectedItem,
    ]
  );

  const handleMultiSelect = useCallback(
    (event, index, item) => {
      const isSelected = (selectedItem as Item[]).indexOf(item) !== -1;
      let nextItems = selectedItem as Item[];

      if (!isSelected) {
        nextItems = nextItems.concat(item).sort(indexComparator);
        setHighlightedIndex(index);
      } else {
        nextItems = nextItems.filter((selected: any) => selected !== item);
      }

      setSelectedItem(
        nextItems as Variant extends ListMultiSelectionVariant ? Item[] : Item
      );

      if (onChange) {
        onChange(
          event,
          nextItems as Variant extends ListMultiSelectionVariant ? Item[] : Item
        );
      }
    },
    [
      indexComparator,
      onChange,
      selectedItem,
      setHighlightedIndex,
      setSelectedItem,
    ]
  );

  const handleRangeSelect = useCallback(
    (event: KeyboardEvent<HTMLElement>, index) => {
      const currentSelection = event.ctrlKey ? selectedItem : ([] as Item[]);

      const lastSelectedItemIndex =
        (selectedItem as Item[]).length > 0
          ? getItemIndex(
              (selectedItem as Item[])[(selectedItem as Item[]).length - 1]
            )
          : 0;

      const startRegion = Math.min(index, lastSelectedItemIndex);
      const endRegion = Math.max(index, lastSelectedItemIndex);
      const rangeSelection = source.slice(startRegion, endRegion + 1);
      // concat the current selection with a new selection and remove duplicates for overlaps
      const nextItems = [
        ...new Set([...(currentSelection as Item[]), ...rangeSelection]),
      ];
      // remove text selection caused by shift clicking
      ownerDocument(event.currentTarget).getSelection()?.removeAllRanges();
      setSelectedItem(
        nextItems as Variant extends ListMultiSelectionVariant ? Item[] : Item
      );

      if (onChange) {
        onChange(
          event,
          nextItems as Variant extends ListMultiSelectionVariant ? Item[] : Item
        );
      }
    },
    [getItemIndex, onChange, selectedItem, setSelectedItem, source]
  );

  const handleExtendedSelect = useCallback(
    (event, index, item) => {
      let nextItems = selectedItem as Item[];
      if (event.shiftKey) {
        handleRangeSelect(event, index);
      } else if ((selectedItem as Item[]).length === 0 || event.ctrlKey) {
        handleMultiSelect(event, index, item);
      } else {
        nextItems = [item];
        setSelectedItem(
          nextItems as Variant extends ListMultiSelectionVariant ? Item[] : Item
        );

        if (onChange) {
          onChange(
            event,
            nextItems as Variant extends ListMultiSelectionVariant
              ? Item[]
              : Item
          );
        }
      }
    },
    [
      handleMultiSelect,
      handleRangeSelect,
      onChange,
      selectedItem,
      setSelectedItem,
    ]
  );

  const handleSelect = useCallback(
    (event, index, item) => {
      if (item == null || item.disabled) {
        return;
      }

      if (onSelect) {
        onSelect(event, item);
      }

      if (isExtendedSelect) {
        handleExtendedSelect(event, index, item);
      } else if (isMultiSelect) {
        handleMultiSelect(event, index, item);
      } else {
        handleSingleSelect(event, index, item);
      }
    },
    [
      handleExtendedSelect,
      handleMultiSelect,
      handleSingleSelect,
      isExtendedSelect,
      isMultiSelect,
      onSelect,
    ]
  );

  const saveFocusedIndex = (index: number) => {
    setLastFocusedIndex(index);
    return index;
  };

  const keyDownHandlers: { [key: string]: keyHandler } = {
    ArrowUp: (event) => {
      event.preventDefault();
      setHighlightedIndex((prevHighlightedIndex?: number) =>
        saveFocusedIndex(Math.max(0, (prevHighlightedIndex ?? itemCount) - 1))
      );
    },
    ArrowDown: (event) => {
      event.preventDefault();
      setHighlightedIndex((prevHighlightedIndex?: number) =>
        saveFocusedIndex(
          Math.min(itemCount - 1, (prevHighlightedIndex ?? -1) + 1)
        )
      );
    },
    PageUp: (event) => {
      event.preventDefault();
      setHighlightedIndex((prevHighlightedIndex?: number) =>
        saveFocusedIndex(
          Math.max(
            0,
            (prevHighlightedIndex ?? displayedItemCount) - displayedItemCount
          )
        )
      );
    },
    PageDown: (event) => {
      event.preventDefault();
      setHighlightedIndex((prevHighlightedIndex?: number) =>
        saveFocusedIndex(
          Math.min(
            itemCount - 1,
            (prevHighlightedIndex ?? 0) + displayedItemCount
          )
        )
      );
    },
    Home: (event) => {
      event.preventDefault();
      setHighlightedIndex(saveFocusedIndex(0));
    },
    End: (event) => {
      event.preventDefault();
      setHighlightedIndex(saveFocusedIndex(itemCount - 1));
    },
    Enter: (event) => {
      event.preventDefault();
      handleSelect(event, highlightedIndex, getItemAtIndex(highlightedIndex));
    },
    " ": (event) => {
      event.preventDefault();
      handleSelect(event, highlightedIndex, getItemAtIndex(highlightedIndex));
    },
    Tab: (event) => {
      if (tabToSelect) {
        handleSelect(event, highlightedIndex, getItemAtIndex(highlightedIndex));
      } else {
        setHighlightedIndex(undefined);
      }
    },
  };

  const handleKeyDown: keyHandler = (event) => {
    if (isFocusVisibleRef.current) {
      setFocusVisible(true);
    }

    const handler: keyHandler = keyDownHandlers[event.key];

    if (handler) {
      handler(event);
    }

    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    handleFocusVisible(event);
    if (isFocusVisibleRef.current) {
      setFocusVisible(true);
    }

    // Work out the index to highlight
    if (highlightedIndex === undefined) {
      const firstSelectedItem = isMultiSelect
        ? (selectedItem as Item[])[0]
        : selectedItem;

      setHighlightedIndex(
        Math.max(
          restoreLastFocus ? lastFocusedIndex : getItemIndex(firstSelectedItem),
          0
        )
      );
    }

    if (onFocus) {
      onFocus(event);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    setHighlightedIndex(undefined);
    handleBlurVisible();
    if (!isFocusVisibleRef.current) {
      setFocusVisible(false);
    }

    if (onBlur) {
      onBlur(event);
    }
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (disableMouseDown) {
      event.preventDefault();
    } else if (onMouseDown) {
      onMouseDown(event);
    }
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    if (focusVisible) {
      // Get the root node of the component if we have access to it otherwise default to current document
      const rootNode = (
        rootRef.current || ownerDocument(event.currentTarget)
      ).getRootNode();

      const listNode = (rootNode as Document).getElementById(id);

      // Safety check as `mouseleave` could have been accidentally triggered by an opening tooltip
      // when you use keyboard to navigate, hence the focusVisible check earlier
      if (listNode?.contains(event.target as Node)) {
        setHighlightedIndex(undefined);
      }
    } else {
      setHighlightedIndex(undefined);
    }

    if (onMouseLeave) {
      onMouseLeave(event);
    }
  };

  const eventHandlers = {
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onMouseDown: handleMouseDown,
    onMouseLeave: handleMouseLeave,
  };

  const ariaProps: listBoxAriaProps = {
    role: "listbox",
    "aria-activedescendant":
      highlightedIndex !== undefined && highlightedIndex >= 0
        ? getItemId(highlightedIndex)
        : undefined,
  };

  if (isMultiSelect) {
    ariaProps["aria-multiselectable"] = true;
  }

  return {
    focusedRef: useForkRef(rootRef, focusVisibleRef),
    state: {
      id,
      focusVisible,
      selectedItem,
      highlightedIndex,
      isDeselectable,
      isMultiSelect,
      isDisabled: disabled,
    },
    helpers: {
      setFocusVisible,
      setSelectedItem,
      setHighlightedIndex,
      keyDownHandlers,
      handleSelect,
    },
    listProps: {
      id,
      source,
      itemCount,
      disableMouseDown,
      displayedItemCount,
      getItemAtIndex,
      getItemIndex,
      getItemId,
      disabled,
      ...ariaProps,
      ...restProps,
      ...(disabled ? {} : eventHandlers),
    },
  };
}

const validateProps = <Item, Variant extends ListSelectionVariant>(
  props: ListProps<Item, Variant>
) => {
  if (process.env.NODE_ENV !== "production") {
    const { source, itemCount, getItemIndex, getItemAtIndex } = props;

    const hasIndexer =
      typeof getItemIndex === "function" &&
      typeof getItemAtIndex === "function";

    const hasNoIndexer =
      getItemIndex === undefined && getItemAtIndex === undefined;

    /* eslint-disable react-hooks/rules-of-hooks */
    useEffect(() => {
      warning(
        source == null || Array.isArray(source),
        "`source` for useList must be an array."
      );
    }, [source]);

    useEffect(() => {
      warning(
        hasNoIndexer || hasIndexer,
        "useList needs to have both `getItemIndex` and `getItemAtIndex`."
      );

      warning(
        hasNoIndexer || itemCount !== undefined,
        "useList needs to have `itemCount` if an indexer is used."
      );
    }, [hasIndexer, hasNoIndexer, itemCount]);
    /* eslint-enable react-hooks/rules-of-hooks */
  }
};
