import { useControlled, useForkRef, useId } from "@jpmorganchase/uitk-core";
import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { InputProps } from "../../input";
import { useList } from "../../list";
import { defaultItemToString } from "../../tokenized-input/internal/defaultItemToString";
import { useIsFocusVisible } from "../../utils";
import { getDefaultFilter, getDefaultFilterRegex } from "../filterHelpers";
import { DefaultComboBoxProps } from "./DefaultComboBox";
import { isToggleList, usePopperStatus } from "./usePopperStatus";

export type UseComboBoxProps<Item> = Omit<
  DefaultComboBoxProps<Item>,
  | "ListItem"
  | "Tooltip"
  | "tooltipEnterDelay"
  | "tooltipLeaveDelay"
  | "tooltipPlacement"
  | "rootRef"
  | "listRef"
  | "inputRef"
  | "rootWidth"
  | "listWidth"
>;

export const useComboBox = <Item>(props: UseComboBoxProps<Item>) => {
  // Deconstruct valid props for List, everything else will be passed to input using `restProps`
  const {
    initialOpen,
    initialSelectedItem,
    allowFreeText,
    displayedItemCount,
    virtualized,
    disabled,
    onBlur,
    onFocus,
    onChange,
    onSelect,
    onInputChange,
    onInputFocus,
    onInputBlur,
    onInputSelect,
    id: idProp,
    source: sourceProp = [],
    selectedItem: selectedItemProp,
    inputValue: inputValueProp,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    getFilterRegex = getDefaultFilterRegex,
    itemToString = defaultItemToString,
    stringToItem: stringToItemProp = (value) => (value ? value.trim() : value),
    InputProps: inputProps = {
      onBlur: onBlur || onInputBlur,
      onFocus: onFocus || onInputFocus,
      onChange: onInputChange,
      onSelect: onInputSelect,
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
    name: "ComboBox",
    state: "inputValue",
  });

  const [selectionChanged, setSelectionChanged] = useState(false);
  const inputRef = useRef<HTMLElement>(null);

  const [allowAnnouncement, setAllowAnnouncement] = useState(false);

  const labels = useMemo(
    () => sourceProp.map(itemToString),
    [sourceProp, itemToString]
  );

  const source = useMemo(() => {
    if (inputValue && inputValue.trim().length) {
      const itemFilter = getDefaultFilter(inputValue, getFilterRegex);
      return sourceProp.filter((item) => itemFilter(itemToString(item)));
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

  const { focusedRef, state, helpers, listProps } = useList({
    ...ListProps,
    source,
    disabled,
    virtualized,
    itemToString,
    initialSelectedItem,
    selectedItem: selectedItemProp,
    displayedItemCount,
    onChange,
    onSelect,
    id: listId,
    tabToSelect: true,
    disableFocus: true,
    disableMouseDown: true,
    "aria-labelledby": ariaLabelledBy,
  });

  const {
    isFocusVisibleRef,
    onFocus: handleFocusVisible,
    onBlur: handleBlurVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible();

  const handleFocusVisibleRef = useForkRef(focusVisibleRef, focusedRef);
  const handleInputRef = useForkRef(inputRef, handleFocusVisibleRef);

  const { "aria-activedescendant": ariaActiveDescendant, ...restListProps } =
    listProps;

  const { selectedItem, highlightedIndex } = state;
  const [quickSelection, setQuickSelection] = useState(false);
  const { setFocusVisible, setSelectedItem, setHighlightedIndex } = helpers;

  const reconcileInput = useCallback(() => {
    setInputValue(selectedItem == null ? "" : itemToString(selectedItem));
  }, [selectedItem, itemToString, setInputValue]);

  const selectInputValue = (event: ChangeEvent) => {
    const nextIndex = inputValue ? labels.indexOf(inputValue.trim()) : -1;

    // Select the item if we can match its label; otherwise create a new one
    const nextItem = (
      nextIndex >= 0 ? sourceProp[nextIndex] : stringToItemProp(inputValue)
    ) as Item;

    if (onSelect) {
      onSelect(event, nextItem);
    }

    if (nextItem !== selectedItem) {
      setSelectedItem(nextItem);
      onChange && onChange(event, nextItem);
    }
  };

  const { isOpen: isListOpen, notifyPopper } = usePopperStatus({
    initialOpen,
  });

  // Reconcile input when the function is updated - most likely to be a selectItem change
  useEffect(reconcileInput, [reconcileInput]);

  // Reset highlight when list closes
  useEffect(() => {
    if (!isListOpen) {
      setHighlightedIndex(undefined);
      setQuickSelection(false);
    }
  }, [isListOpen, setHighlightedIndex, quickSelection]);

  const initHighlightedIndex = () => {
    setHighlightedIndex(selectedItem ? source.indexOf(selectedItem) : -1);
  };

  const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    handleFocusVisible(event);
    if (isFocusVisibleRef.current) {
      setFocusVisible(true);
    }

    if (highlightedIndex == null) {
      initHighlightedIndex();
    }

    if (inputProps.onFocus) {
      inputProps.onFocus(event);
    }

    notifyPopper(event);
  };

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    handleBlurVisible();
    setAllowAnnouncement(false);

    if (allowFreeText) {
      selectInputValue(event as ChangeEvent);
    } else {
      reconcileInput();
    }

    if (restListProps.onBlur) {
      restListProps.onBlur(event as FocusEvent<HTMLDivElement>);
    }

    if (inputProps.onBlur) {
      inputProps.onBlur(event);
    }

    notifyPopper(event);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    setHighlightedIndex(undefined);
    setQuickSelection(newValue.length > 0 && !allowFreeText);

    // Clear the selection when input is cleared
    if (newValue.length === 0) {
      setSelectedItem();
      onChange && onChange(event, null);
    }

    if (inputProps.onChange) {
      inputProps.onChange(event, "");
    }
  };

  const handleInputSelect = (event: SyntheticEvent<HTMLDivElement>) => {
    setSelectionChanged(true);
    if (inputProps.onSelect) {
      inputProps.onSelect(event);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent) => {
    if ("Escape" === event.key) {
      setHighlightedIndex(undefined);

      if (allowFreeText) {
        setInputValue("");
      } else {
        reconcileInput();
      }
    }

    if (inputProps.onKeyDown) {
      inputProps.onKeyDown(event as KeyboardEvent<HTMLInputElement>);
    }
  };

  const handleFirstItemSelection = (event: KeyboardEvent | ChangeEvent) => {
    if (
      !allowFreeText &&
      (event as KeyboardEvent).key === "Enter" &&
      quickSelection
    ) {
      setSelectedItem(source[0]);
      onSelect && onSelect(event, source[0]);
      onChange && onChange(event as ChangeEvent, source[0]);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't handle Alt modification key - pass it to popper as it should just toggle the open/close
    if (isToggleList(event)) {
      notifyPopper(event);
      return;
    }

    if (
      ["ArrowUp", "ArrowDown"].indexOf(event.key) !== -1 &&
      highlightedIndex == null
    ) {
      initHighlightedIndex();
    }

    handleFirstItemSelection(event);

    // Space, Home and End keydown should stay on input - don't pass it to list
    if ([" ", "Home", "End"].indexOf(event.key) === -1) {
      if (restListProps.onKeyDown) {
        restListProps.onKeyDown(event as KeyboardEvent<HTMLDivElement>);
      }
      setSelectionChanged(false);
    }

    // Don't announce for deleting values
    setAllowAnnouncement("Backspace" !== event.key);
    handleInputKeyDown(event);
    notifyPopper(event);
  };

  const handleListClick = (event: MouseEvent) => {
    const inputEl = inputRef.current;
    if (inputEl != null) {
      inputEl.focus();
    }

    if (restListProps.onClick) {
      restListProps.onClick(event as MouseEvent<HTMLDivElement>);
    }

    notifyPopper(event);
  };

  const mergedInputProps = {
    ...inputProps.inputProps,
    role: "combobox",
    "aria-owns": listId,
    "aria-label": ariaLabel,
    "aria-expanded": isListOpen,
    "aria-activedescendant":
      isListOpen && selectionChanged ? null : ariaActiveDescendant,
  };

  return {
    inputRef: handleInputRef,
    listContext: {
      state,
      helpers,
    },
    inputProps: {
      ...restProps,
      ...inputProps,
      disabled,
      allowAnnouncement,
      id: inputId,
      value: inputValue,
      onFocus: handleInputFocus,
      onBlur: handleInputBlur,
      onChange: handleInputChange,
      onKeyDown: handleKeyDown,
      onSelect: handleInputSelect,
      inputProps: mergedInputProps,
    } as Partial<InputProps> & { allowAnnouncement: boolean },
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
