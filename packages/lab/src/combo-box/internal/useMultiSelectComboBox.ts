import {
  useControlled,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEvent,
  RefObject,
  SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useList } from "../../list";
import { ExpandButtonProps, useTokenizedInput } from "../../tokenized-input";
import { defaultItemToString } from "../../tokenized-input/internal/defaultItemToString";
import { useIsFocusVisible, usePrevious } from "../../utils";
import { getDefaultFilter, getDefaultFilterRegex } from "../filterHelpers";
import { MultiSelectComboBoxProps } from "./MultiSelectComboBox";
import { isToggleList, usePopperStatus } from "./usePopperStatus";

const REQUIRE_PREV_HIGHLIGHT = ["ArrowUp", "ArrowDown", "PageUp", "PageDown"];

export type UseMultiSelectComboBoxProps<Item> = Omit<
  MultiSelectComboBoxProps<Item>,
  "inputRef" | "listContext" | "inputHelpers" | "inputProps" | "listProps"
> & { expandButtonRef: RefObject<HTMLElement> };

export const useMultiSelectComboBox = <Item>(
  props: Omit<UseMultiSelectComboBoxProps<Item>, "rootRef" | "classes">
) => {
  // Deconstruct valid props for List, everything else will be passed to `useTokenizedInput` using `restProps`
  const {
    allowFreeText,
    displayedItemCount,
    virtualized,
    disabled,
    expandButtonRef,
    onBlur,
    onFocus,
    onChange,
    onSelect,
    onInputChange,
    onInputFocus,
    onInputBlur,
    onInputSelect,
    id: idProp,
    source: sourceProp,
    selectedItem: selectedItemProp,
    inputValue: inputValueProp,
    initialOpen,
    initialSelectedItem: initialSelectedItems,
    "aria-labelledby": ariaLabelledBy,
    getFilterRegex = getDefaultFilterRegex,
    itemToString = defaultItemToString,
    stringToItem: stringToItemProp = (_: any, value: string) => value.trim(),
    InputProps = {
      onBlur,
      onFocus,
      onInputBlur,
      onInputFocus,
      onInputChange,
      onInputSelect,
    },
    ListProps = {},
    ...restProps
  } = props;

  const id = useId(idProp);
  const inputId = `${id}-input`;
  const listId = `${id}-list`;

  const [inputValue, setInputValue] = useControlled({
    controlled: inputValueProp,
    default: "",
    name: "MultiSelectComboBox",
    state: "inputValue",
  });

  const { isOpen: isListOpen, notifyPopper } = usePopperStatus({
    initialOpen,
    isMultiSelect: true,
  });

  const [selectionChanged, setSelectionChanged] = useState(false);
  const inputBlurTimeout = useRef<number>(null);

  const [allowAnnouncement, setAllowAnnouncement] = useState(false);

  const labels = useMemo(
    () => sourceProp.map(itemToString),
    [sourceProp, itemToString]
  );

  const source = useMemo(() => {
    if (inputValue && inputValue.trim().length) {
      const itemFilter = getDefaultFilter(inputValue, getFilterRegex);
      return sourceProp.filter((item: Item) => itemFilter(itemToString(item)));
    }
    return sourceProp;
  }, [inputValue, sourceProp, getFilterRegex, itemToString]);

  const itemTextHighlightPattern = useMemo(
    () =>
      inputValue && inputValue.trim().length
        ? getFilterRegex(inputValue)
        : undefined,
    [inputValue, getFilterRegex]
  );

  const {
    focusedRef,
    listProps,
    state: listState,
    helpers: listHelpers,
  } = useList<Item, "multiple">({
    ...ListProps,
    source,
    disabled,
    virtualized,
    itemToString,
    displayedItemCount,
    onChange,
    onSelect,
    id: listId,
    disableFocus: true,
    disableMouseDown: true,
    selectionVariant: "multiple",
    initialSelectedItem: initialSelectedItems,
    selectedItem: selectedItemProp,
    "aria-labelledby": ariaLabelledBy,
  });

  const { "aria-activedescendant": ariaActiveDescendant, ...restListProps } =
    listProps;
  const { selectedItem } = listState;
  const [quickSelection, setQuickSelection] = useState(false);
  const {
    isFocusVisibleRef,
    onFocus: handleFocusVisible,
    onBlur: handleBlurVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible();
  const selectedItems = selectedItem as Item[];
  const {
    setSelectedItem: setSelectedItems,
    setHighlightedIndex: setHighlightedListIndex,
  } = listHelpers;

  const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    handleFocusVisible(event);
    if (isFocusVisibleRef.current) {
      listHelpers.setFocusVisible(true);
    }

    if (InputProps.onInputFocus) {
      InputProps.onInputFocus(event);
    }

    notifyPopper(event);
  };

  const handleInputBlur = (
    event: FocusEvent<HTMLDivElement | HTMLInputElement>
  ) => {
    handleBlurVisible();
    setAllowAnnouncement(false);
    setInputValue("");

    if (restListProps.onBlur) {
      restListProps.onBlur(event);
    }

    if (InputProps.onInputBlur) {
      InputProps.onInputBlur(event as FocusEvent<HTMLInputElement>);
    }

    notifyPopper(event);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);

    setQuickSelection(event.target.value.length > 0 && !allowFreeText);

    if (InputProps.onInputChange) {
      InputProps.onInputChange(event);
    }
  };

  const handleItemsChange = (newItems: Item[] | undefined) => {
    const uniqueItems = Array.from(new Set(newItems));
    setSelectedItems(uniqueItems);
    onChange && onChange(null as unknown as ChangeEvent, uniqueItems);
  };

  const handleInputSelect = (event: SyntheticEvent<HTMLInputElement>) => {
    event.persist();
    setSelectionChanged(true);

    if (InputProps.onInputSelect) {
      InputProps.onInputSelect(event);
    }
  };

  const handleClear = () => {
    setSelectedItems([]);
  };

  const stringToItem = (selected: Item[], value: string): Item | null => {
    const trimmed = value.trim();
    const item = stringToItemProp(selected, trimmed);
    const isSelected = selected.map(itemToString).indexOf(trimmed) !== -1;

    // Either allow free text item OR the item has to be in the source list
    return !isSelected && (allowFreeText || labels.indexOf(trimmed) !== -1)
      ? (item as Item)
      : null;
  };

  // Reuse selectItem from list state for a controlled version of tokenized input
  const {
    inputRef,
    inputProps,
    state: inputState,
    helpers: inputHelpers,
  } = useTokenizedInput({
    ...restProps,
    ...InputProps,
    disabled,
    itemToString,
    stringToItem,
    selectedItems,
    initialSelectedItems,
    onInputFocus: handleInputFocus,
    onInputBlur: handleInputBlur,
    onInputChange: handleInputChange,
    onInputSelect: handleInputSelect,
    onChange: handleItemsChange,
    onClear: handleClear,
    onKeyDown: InputProps.onKeyDown as KeyboardEventHandler<
      HTMLInputElement | HTMLButtonElement
    >,
  });

  const handleFocusVisibleRef = useForkRef(focusVisibleRef, focusedRef);
  const handleInputRef = useForkRef(inputRef, handleFocusVisibleRef);

  const { setHighlightedIndex: setHighlightedPillIndex } = inputHelpers;

  // Reset highlight when list closes
  useEffect(() => {
    if (!isListOpen) {
      setHighlightedListIndex(undefined);
      setQuickSelection(false);
    }
  }, [isListOpen, setHighlightedListIndex, setQuickSelection]);

  const previousSelectedItems = usePrevious(selectedItems);

  // Reset list highlight when selectItems change
  useIsomorphicLayoutEffect(() => {
    if (
      selectedItems.some(
        (item) => !(previousSelectedItems || []).includes(item)
      )
    ) {
      setInputValue("");
    }

    if (!selectedItems.length) {
      setHighlightedListIndex(undefined);
    }
  }, [
    selectedItems,
    previousSelectedItems,
    setInputValue,
    setHighlightedListIndex,
  ]);

  // Remove highlight from list if a pill is highlighted
  useEffect(() => {
    if (
      inputState.highlightedIndex != null &&
      inputState.highlightedIndex >= 0
    ) {
      setHighlightedListIndex(undefined);
      setQuickSelection(false);
    }
  }, [inputState.highlightedIndex, setHighlightedListIndex, setQuickSelection]);

  const highlightedIndex = listState && listState.highlightedIndex;

  // Remove highlight from pills if a list item is highlighted
  useEffect(() => {
    if (highlightedIndex != null && highlightedIndex >= 0) {
      setHighlightedPillIndex(undefined);
    }
  }, [highlightedIndex, setHighlightedPillIndex]);

  // Keep highlighted index in sync with the filtered source
  useEffect(() => {
    setHighlightedListIndex(undefined);
  }, [source, setHighlightedListIndex]);

  const handleFirstItemSelection = (event: KeyboardEvent | ChangeEvent) => {
    if (
      !allowFreeText &&
      (event as KeyboardEvent).key === "Enter" &&
      quickSelection
    ) {
      const newItem = source[0];
      const newSelectedItems =
        selectedItems.indexOf(newItem) === -1
          ? selectedItems.concat(source.slice(0, 1))
          : selectedItems.filter((item) => item !== newItem);
      setSelectedItems(newSelectedItems);
      onSelect && onSelect(event, newItem);
      onChange && onChange(event as ChangeEvent, newSelectedItems);
    }
  };

  const handleListOpenKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ("Escape" === event.key && inputProps.expanded) {
      setTimeout(() => {
        if (expandButtonRef.current) {
          expandButtonRef.current.focus();
        }
      }, 250);
    }

    handleFirstItemSelection(event);

    if (
      "Home" !== event.key &&
      "End" !== event.key &&
      !(" " === event.key && !event.ctrlKey)
    ) {
      if (restListProps.onKeyDown) {
        restListProps.onKeyDown(event);
      }
      setSelectionChanged(false);
    }
  };

  const handleInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLButtonElement | HTMLDivElement>
  ) => {
    if ("Escape" === event.key) {
      setInputValue("");
      setHighlightedListIndex(undefined);
    }

    // Space key clashes with the remove action of TokenizedInput
    // For combo box, pressing a space key should just add a space
    if (" " === event.key && !event.ctrlKey) {
      setHighlightedPillIndex(undefined);
    } else {
      if (inputProps.onKeyDown) {
        inputProps.onKeyDown(
          event as KeyboardEvent<HTMLInputElement | HTMLButtonElement>
        );
      }
    }

    if (
      !isToggleList(event) &&
      listState.highlightedIndex == null &&
      REQUIRE_PREV_HIGHLIGHT.indexOf(event.key) !== -1
    ) {
      event.preventDefault();
      // Initialize list highlight if there's no previous value
      setHighlightedListIndex(
        Math.min(quickSelection ? 1 : 0, source.length - 1)
      );
      setQuickSelection(false);
      setSelectionChanged(false);
    } else if (isListOpen) {
      handleListOpenKeyDown(event as KeyboardEvent<HTMLDivElement>);
    }

    // Don't announce for deleting values
    setAllowAnnouncement("Backspace" !== event.key);
    notifyPopper(event);
  };

  const handleListClick = (event: MouseEvent<HTMLDivElement>) => {
    clearTimeout(
      inputBlurTimeout.current == null ? undefined : inputBlurTimeout.current
    );
    const inputEl = inputRef && (inputRef as RefObject<HTMLElement>).current;
    if (inputEl) {
      inputEl.focus();
    }

    if (restListProps.onClick) {
      restListProps.onClick(event);
    }
  };

  const mergedInputProps = {
    ...inputProps.InputProps,
    inputProps: {
      ...(inputProps.InputProps || {}).inputProps,
      role: "textbox",
      "aria-roledescription": "MultiSelect Combobox",
    },
  };

  if (ariaActiveDescendant && !selectionChanged) {
    // either null or undefined will prevent tokenized-input from
    // setting active-descendant based on pill selection.
    mergedInputProps.inputProps["aria-activedescendant"] = ariaActiveDescendant;
  }

  const expandButtonProps = {
    accessibleText: undefined,
    role: "button",
    "aria-roledescription": "Expand combobox button",
    "aria-labelledby": [ariaLabelledBy, `${inputId}-input`]
      .filter(Boolean)
      .join(" "),
  } as ExpandButtonProps;

  return {
    inputHelpers,
    inputRef: handleInputRef,
    listContext: {
      state: listState,
      helpers: listHelpers,
    },
    inputProps: {
      ...inputProps,
      selectedItems,
      allowAnnouncement,
      id: inputId,
      value: inputValue,
      ExpandButtonProps: expandButtonProps,
      InputProps: mergedInputProps,
      onKeyDown: handleInputKeyDown,
    },
    listProps: {
      ...restListProps,
      source,
      itemToString,
      itemTextHighlightPattern,
      onClick: handleListClick,
      isListOpen: isListOpen && Boolean(source.length),
    },
  };
};
