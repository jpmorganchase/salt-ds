import {
  Input,
  InputProps,
  useIdMemo as useId,
} from "@jpmorganchase/uitk-core";
import { ForwardedRef, forwardRef, ReactElement, useCallback } from "react";

import { DropdownBase, DropdownBaseProps } from "../dropdown";
import { List, ListProps } from "../list";

import {
  CollectionItem,
  CollectionProvider,
  SelectionProps,
  SelectionStrategy,
  SingleSelectionStrategy,
  useCollectionItems,
} from "../common-hooks";
import { useCombobox } from "./useCombobox";

export interface ComboBoxProps<
  Item = string,
  Selection extends SelectionStrategy = "default"
> extends Omit<
      DropdownBaseProps,
      "triggerComponent" | "onBlur" | "onChange" | "onFocus"
    >,
    Pick<InputProps, "onBlur" | "onChange" | "onFocus" | "onSelect">,
    Pick<
      ListProps<Item, Selection>,
      "ListItem" | "itemToString" | "source" | "width"
    >,
    Pick<
      SelectionProps<Item, Selection>,
      "onSelectionChange" | "selectionStrategy"
    > {
  InputProps?: InputProps;
  ListProps?: Omit<
    ListProps<Item, Selection>,
    "ListItem" | "itemToString" | "source"
  >;
  allowFreeText?: boolean;
  defaultValue?: string;
  getFilterRegex?: (inputValue: string) => RegExp;
  stringToItem?: (value?: string) => Item | null | undefined;
  value?: string;
}

export const ComboBox = forwardRef(function Combobox<
  Item = "string",
  Selection extends SelectionStrategy = "default"
>(
  {
    InputProps,
    ListProps,
    ListItem,
    "aria-label": ariaLabel,
    allowFreeText,
    children,
    defaultIsOpen,
    defaultValue,
    disabled,
    onBlur,
    onFocus,
    onChange,
    onSelect,
    getFilterRegex,
    id: idProp,
    isOpen: isOpenProp,
    itemToString,
    onOpenChange: onOpenChangeProp,
    onSelectionChange,
    selectionStrategy,
    source,
    stringToItem,
    value: valueProp,
    width = 180,
    ...props
  }: ComboBoxProps<Item, Selection>,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const id = useId(idProp);

  const collectionHook = useCollectionItems<Item>({
    id,
    source,
    children,
    options: {
      filterPattern: valueProp ?? defaultValue,
      getFilterRegex,
      itemToString,
    },
  });

  const {
    focusVisible,
    highlightedIndex,
    inputProps,
    isOpen,
    listHandlers,
    listControlProps: controlProps,
    onOpenChange,
    selected,
  } = useCombobox<Item, Selection>({
    InputProps,
    allowFreeText,
    ariaLabel,
    collectionHook,
    defaultIsOpen,
    defaultValue,
    disabled,
    onBlur,
    onFocus,
    onChange,
    onSelect,
    id,
    isOpen: isOpenProp,
    itemToString,
    label: "ComboBox",
    onOpenChange: onOpenChangeProp,
    onSelectionChange,
    selectionStrategy,
    stringToItem,
    value: valueProp,
  });

  const collectionItemsToItem = useCallback(
    (
      sel?: CollectionItem<Item> | null | CollectionItem<Item>[]
    ):
      | undefined
      | (Selection extends SingleSelectionStrategy ? Item | null : Item[]) => {
      type returnType = Selection extends SingleSelectionStrategy
        ? Item | null
        : Item[];
      if (Array.isArray(sel)) {
        return sel.map((i) => i.value) as returnType;
      } else if (sel) {
        return sel.value as returnType;
      } else {
        return sel as returnType;
      }
    },
    []
  );

  return (
    <CollectionProvider<Item> collectionHook={collectionHook}>
      <DropdownBase
        {...props}
        fullWidth
        id={id}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        openOnFocus
        ref={forwardedRef}
        width={width}
      >
        <Input
          {...inputProps}
          disabled={disabled}
          // ref={useForkRef(setInputRef, setHookInputRef)}
          {...controlProps}
        />

        <List<Item, Selection>
          {...ListProps}
          ListItem={ListItem}
          focusVisible={focusVisible}
          highlightedIndex={highlightedIndex}
          itemTextHighlightPattern={inputProps.value || undefined}
          id={`${id}-list`}
          listHandlers={listHandlers}
          onSelectionChange={onSelectionChange}
          selected={collectionItemsToItem(selected)}
          selectionStrategy={selectionStrategy}
        />
      </DropdownBase>
    </CollectionProvider>
  );
}) as <Item, Selection extends SelectionStrategy = "default">(
  props: ComboBoxProps<Item, Selection> & {
    ref?: ForwardedRef<HTMLDivElement>;
  }
) => ReactElement<ComboBoxProps<Item, Selection>>;
