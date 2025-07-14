import { useControlled } from "@salt-ds/core";
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type CollectionItem,
  itemToString as defaultItemToString,
  type SelectionChangeHandler,
  type SelectionStrategy,
  type SingleSelectionStrategy,
} from "../common-hooks";
import type { DropdownHookProps, DropdownHookResult } from "../dropdown";
import type { InputLegacyProps as InputProps } from "../input-legacy";
import { type ListHookProps, type ListHookResult, useList } from "../list";

const NULL_REF = { current: null };
const EnterOnly = ["Enter"];

export interface ComboboxHookProps<Item, Strategy extends SelectionStrategy>
  extends Partial<Omit<DropdownHookProps, "id" | "onKeyDown">>,
    Pick<InputProps, "onBlur" | "onChange" | "onFocus" | "onSelect">,
    Omit<
      ListHookProps<Item, Strategy>,
      "containerRef" | "defaultSelected" | "selected" | "onSelect"
    > {
  InputProps?: InputProps;
  allowFreeText?: boolean;
  ariaLabel?: string;
  defaultValue?: string;
  id: string;
  itemToString?: (item: Item) => string;
  stringToItem?: (value?: string) => Item | null | undefined;
  value?: string;
}

export interface ComboboxHookResult<Item, Selection extends SelectionStrategy>
  extends Pick<
      ListHookResult<Item, Selection>,
      | "focusVisible"
      | "highlightedIndex"
      | "listControlProps"
      | "listHandlers"
      | "selected"
    >,
    Partial<DropdownHookResult> {
  inputProps: InputProps;
  onOpenChange: (isOpen: boolean) => void;
}

export const useCombobox = <
  Item,
  Selection extends SelectionStrategy = "default",
>({
  allowFreeText,
  ariaLabel,
  collectionHook,
  defaultIsOpen,
  defaultValue,
  onBlur,
  onFocus,
  onChange,
  onSelect,
  id,
  isOpen: isOpenProp,
  itemToString = defaultItemToString as (item: Item) => string,
  onOpenChange,
  onSelectionChange,
  selectionStrategy,
  stringToItem,
  value: valueProp,
  InputProps: inputProps = {
    onBlur,
    onFocus,
    onChange,
    onSelect,
  },
}: ComboboxHookProps<Item, Selection>): ComboboxHookResult<Item, Selection> => {
  type selectedCollectionType = Selection extends SingleSelectionStrategy
    ? CollectionItem<Item> | null
    : CollectionItem<Item>[];
  const isMultiSelect =
    selectionStrategy === "multiple" || selectionStrategy === "extended";

  const selectedValue = collectionHook.stringToCollectionItem<Selection>(
    valueProp ?? defaultValue ?? null,
  );

  const {
    data: indexPositions,
    itemToCollectionItem,
    setFilterPattern,
    stringToCollectionItem,
  } = collectionHook;
  const setHighlightedIndexRef = useRef<null | ((i: number) => void)>(null);
  const setSelectedRef = useRef<
    null | ListHookResult<Item, Selection>["setSelected"]
  >(null);
  // Input select events are used to identify user navigation within the input text.
  // The initial select event fired on focus is an exception that we ignore.
  const ignoreSelectOnFocus = useRef(true);
  const selectedRef = useRef<selectedCollectionType>(selectedValue);

  const [isOpen, setIsOpen] = useControlled<boolean>({
    controlled: isOpenProp,
    default: defaultIsOpen ?? false,
    name: "useDropdownList",
  });

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue ?? "",
    name: "ComboBox",
    state: "value",
  });

  const collectionItemsToItem = useCallback(
    (
      sel: CollectionItem<Item> | null | CollectionItem<Item>[],
    ): Selection extends SingleSelectionStrategy ? Item | null : Item[] => {
      type returnType = Selection extends SingleSelectionStrategy
        ? Item | null
        : Item[];
      if (Array.isArray(sel)) {
        return sel.map((i) => i.value) as returnType;
      }
      if (sel) {
        return sel.value as returnType;
      }
      return sel as returnType;
    },
    [],
  );

  const [disableAriaActiveDescendant, setDisableAriaActiveDescendant] =
    useState(true);
  const [quickSelection, setQuickSelection] = useState(false);

  const highlightSelectedItem = useCallback(
    (selected: selectedCollectionType = selectedRef.current) => {
      if (Array.isArray(selected)) {
        console.log("TODO multi selection");
      } else if (selected == null) {
        setHighlightedIndexRef.current?.(-1);
      } else {
        const indexOfSelectedItem = indexPositions.indexOf(selected);
        setHighlightedIndexRef.current?.(indexOfSelectedItem);
      }
    },
    [indexPositions],
  );

  const setTextValue = useCallback(
    (value: string) => {
      setValue(value);
      setFilterPattern(value === "" ? undefined : value);
    },
    [setFilterPattern],
  );

  const reconcileInput = useCallback(
    (selected: selectedCollectionType = selectedRef.current) => {
      let value = "";
      if (Array.isArray(selected)) {
        console.log("TODO multi selection");
      } else if (selected != null && selected.value !== null) {
        value = itemToString(selected.value);
      }
      setTextValue(value);
      if (value === "") {
        setHighlightedIndexRef.current?.(-1);
      } else {
        highlightSelectedItem(selected);
      }
    },
    [highlightSelectedItem, itemToString, setTextValue],
  );

  const applySelection = useCallback(
    (evt: any, selected: selectedCollectionType) => {
      if (!isMultiSelect) {
        setIsOpen(false);
      }
      selectedRef.current = selected;
      reconcileInput(selected);
      onSelectionChange?.(evt, collectionItemsToItem(selected ?? null));
    },
    [collectionItemsToItem, isMultiSelect, onSelectionChange, reconcileInput],
  );

  const handleSelectionChange = useCallback<
    SelectionChangeHandler<Item, Selection>
  >(
    (evt, selected) => {
      if (!isMultiSelect) {
        const selectedCollectionItem = itemToCollectionItem<
          Selection,
          typeof selected
        >(selected);
        applySelection(evt, selectedCollectionItem);
      }
    },
    [applySelection, isMultiSelect, itemToCollectionItem],
  );

  const handleFirstItemSelection = useCallback(
    (evt: KeyboardEvent | ChangeEvent) => {
      if (
        !allowFreeText &&
        (evt as KeyboardEvent).key === "Enter" &&
        quickSelection
      ) {
        const [firstItem] = indexPositions;
        applySelection(evt, firstItem as selectedCollectionType);
      }
    },
    [allowFreeText, applySelection, indexPositions, quickSelection],
  );

  const {
    onKeyDown: inputOnKeyDown,
    onFocus: inputOnFocus,
    onChange: inputOnChange,
    onBlur: inputOnBlur,
    onSelect: inputOnSelect,
  } = inputProps;

  const handleInputKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      if ("Escape" === evt.key) {
        if (allowFreeText) {
          setTextValue("");
        } else {
          reconcileInput();
        }
      } else if ("Tab" === evt.key) {
        if (!allowFreeText) {
          reconcileInput();
        }
      }

      handleFirstItemSelection(evt);

      inputOnKeyDown?.(evt as KeyboardEvent<HTMLInputElement>);
    },
    [
      allowFreeText,
      handleFirstItemSelection,
      inputOnKeyDown,
      reconcileInput,
      setTextValue,
    ],
  );

  const handleKeyboardNavigation = useCallback(() => {
    setDisableAriaActiveDescendant(false);
  }, []);

  const {
    focusVisible,
    setHighlightedIndex,
    highlightedIndex,
    listControlProps,
    listHandlers: listHookListHandlers,
    selected,
    setSelected,
  } = useList<Item, Selection>({
    collectionHook,
    defaultHighlightedIndex: -1,
    disableAriaActiveDescendant,
    disableHighlightOnFocus: true,
    disableTypeToSelect: true,
    onKeyboardNavigation: handleKeyboardNavigation,
    onKeyDown: handleInputKeyDown,
    onSelectionChange: handleSelectionChange,
    containerRef: NULL_REF,
    // we are controlling selection from a ref value - is this right ?
    selected: selectedRef.current,
    selectionKeys: EnterOnly,
    selectionStrategy,
    tabToSelect: !isMultiSelect,
  });

  setHighlightedIndexRef.current = setHighlightedIndex;
  setSelectedRef.current = setSelected;
  // selectedRef.current = selected;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        setQuickSelection(false);
      }
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  const { onClick: listHandlersOnClick } = listHookListHandlers;
  const handleListClick = useCallback(
    (evt: MouseEvent<HTMLElement>) => {
      //TODO use ref
      document.getElementById(`${id}-input`)?.focus();
      // const inputEl = inputRef.current;
      console.log("handle list click");
      listHandlersOnClick?.(evt);
      // if (inputEl != null) {
      //   inputEl.focus();
      // }

      // if (restListProps.onClick) {
      //   restListProps.onClick(event as MouseEvent<HTMLDivElement>);
      // }

      // notifyPopper(event);
    },
    [id, listHandlersOnClick],
  );

  const handleInputChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      const newValue = evt.target.value;
      setValue(newValue);

      if (newValue?.trim().length) {
        setFilterPattern(newValue);
      } else {
        setFilterPattern(undefined);
        if (selectedRef.current !== null) {
          onSelectionChange?.(
            evt,
            null as Selection extends SingleSelectionStrategy
              ? Item | null
              : Item[],
          );
        }
        selectedRef.current = null as selectedCollectionType;
      }

      setIsOpen(true);

      setQuickSelection(newValue.length > 0 && !allowFreeText);

      inputOnChange?.(evt, newValue);
    },
    [allowFreeText, inputOnChange, setFilterPattern, onSelectionChange],
  );

  const { onFocus: listOnFocus } = listControlProps;
  const handleInputFocus = useCallback(
    (evt: FocusEvent<HTMLInputElement>) => {
      setDisableAriaActiveDescendant(false);
      listOnFocus?.(evt);
      inputOnFocus?.(evt);
    },
    [inputOnFocus, listOnFocus],
  );

  const listFocused = useCallback(
    (evt: FocusEvent) => {
      const element = evt.relatedTarget as HTMLElement;
      return element?.id === `${id}-list`;
    },
    [id],
  );

  // When focus leaves a free text combo, check to see if the entered text is
  // a valid selection, if so fire a change event
  const selectInputValue = useCallback(
    (evt: ChangeEvent) => {
      const text = value.trim();
      if (text) {
        const selectedCollectionItem = stringToCollectionItem<"default">(
          text,
        ) as selectedCollectionType;
        if (selectedCollectionItem) {
          if (Array.isArray(selectedCollectionItem)) {
            // TODO multi select
          } else if (selectedCollectionItem !== selected) {
            setSelectedRef.current?.(selectedCollectionItem);
            onSelectionChange?.(
              evt,
              selectedCollectionItem.value as Selection extends SingleSelectionStrategy
                ? Item | null
                : Item[],
            );
          }
        } else if (stringToItem) {
          const item = stringToItem(text);
          if (item) {
            console.log("we have a new item");
          }
        }
        // How do we check if string is Item
      }
    },
    [onSelectionChange, selected, stringToItem, stringToCollectionItem, value],
  );

  const { onBlur: listOnBlur } = listControlProps;
  const handleInputBlur = useCallback(
    (evt: FocusEvent<HTMLInputElement>) => {
      if (listFocused(evt)) {
        // nothing doing
      } else {
        listOnBlur?.(evt);
        inputOnBlur?.(evt);
        if (allowFreeText) {
          selectInputValue(evt as ChangeEvent);
        } else {
          reconcileInput();
        }
        setDisableAriaActiveDescendant(true);
        ignoreSelectOnFocus.current = true;
      }
    },
    [
      allowFreeText,
      listFocused,
      inputOnBlur,
      listOnBlur,
      reconcileInput,
      selectInputValue,
    ],
  );

  const handleInputSelect = useCallback(
    (event: SyntheticEvent<HTMLDivElement>) => {
      if (ignoreSelectOnFocus.current) {
        ignoreSelectOnFocus.current = false;
      } else {
        setDisableAriaActiveDescendant(true);
      }
      inputOnSelect?.(event);
    },
    [inputOnSelect],
  );

  // If we have selected item(s) and we filter down the list by typing,
  // the position of selected items within the list may be changing.
  // Relocate highlighted index to the selection whenever this happens,
  // so if we resume keyboard navigation, navigation begins from the selected
  // item.
  useEffect(() => {
    highlightSelectedItem();
    // TODO may need to scrollIntoView
    if (indexPositions.length === 0) {
      setIsOpen(false);
    }
  }, [highlightSelectedItem, indexPositions.length]);

  // const activeDescendant: string | undefined = selectionChanged
  //   ? ""
  //   : undefined;

  const mergedInputProps = {
    ...inputProps.inputProps,
    // "aria-owns": listId,
    "aria-label": ariaLabel,
  };

  return {
    focusVisible,
    highlightedIndex,
    isOpen,
    onOpenChange: handleOpenChange,
    inputProps: {
      ...inputProps,
      // "aria-activedescendant": activeDescendant,
      id: `${id}-input`,
      inputProps: mergedInputProps,
      onChange: handleInputChange,
      onSelect: handleInputSelect,
      role: "combobox",
      value,
    },
    // listControlProps,
    listControlProps: {
      ...listControlProps,
      onBlur: handleInputBlur,
      onFocus: handleInputFocus,
    },
    listHandlers: {
      ...listHookListHandlers,
      onClick: handleListClick,
    },
    selected,
  };
};
