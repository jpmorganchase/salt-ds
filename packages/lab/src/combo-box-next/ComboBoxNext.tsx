import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  ForwardedRef,
  forwardRef,
  ReactElement,
  Ref,
  SyntheticEvent,
  useRef,
} from "react";
import {
  Input,
  makePrefixer,
  useForkRef,
  useId,
  useFloatingComponent,
} from "@salt-ds/core";
import { ListNext, ListNextProps } from "../list-next";
import { useComboBox } from "./useComboBox";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import comboBoxNextCss from "./ComboBoxNext.css";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { DefaultListItem, defaultFilter, ComboBoxItemProps } from "./utils";
import { clsx } from "clsx";
import { UseComboBoxPortalProps } from "./useComboboxPortal";

const withBaseName = makePrefixer("saltComboBoxNext");

export interface ComboBoxNextProps<T>
  extends Omit<ComponentPropsWithoutRef<"input">, "onChange" | "onSelect"> {
  /**
   * Additional props for the list component.
   */
  ListProps?: ListNextProps;
  /**
   * Additional props for the portal.
   */
  PortalProps?: UseComboBoxPortalProps;
  /**
   * Controlled prop. Controls the Input value in the Combo Box Input.
   */
  inputValue?: string;
  /**
   * Controlled prop. Controls the Highlighted item in the Combo Box list.
   */
  highlightedItem?: string;
  /**
   * Controlled prop. Controls the Selected value in the Combo Box list.
   */
  selected?: string;
  /**
   * Initial input value for when the list is uncontrolled.
   */
  defaultInputValue?: string;
  /**
   * Initial selected value for when the list is uncontrolled.
   */
  defaultSelected?: string;
  /**
   * If `true`, the component will be disabled.
   */
  disabled?: boolean;
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
  /**
   * The source of combobox items.
   */
  source: T[];
  /**
   * Optional ref for the list component
   */
  listRef?: Ref<HTMLUListElement>;
  /**
   * The component used for item instead of the default.
   */
  ListItem?: (
    props: ComboBoxItemProps<T>
  ) => ReactElement<ComboBoxItemProps<T>>;
  /**
   * Function to be used as filter.
   */
  itemFilter?: (source: T[], filterValue?: string) => T[];
  /**
   * Callback for mouse over event
   */
  onMouseOver?: (event: SyntheticEvent) => void;
  /**
   * Callback for list selection event
   */
  onSelect?: (event: SyntheticEvent, data: { value: string }) => void;
  /**
  /**
   * Callback for list change event
   */
  onListChange?: (
    event: SyntheticEvent,
    data: { value: string | undefined }
  ) => void;
  /**
   * Callback for input change event
   */
  onChange?: (event: SyntheticEvent, data: { value: string }) => void;
}

export const ComboBoxNext = forwardRef(function ComboBoxNext<T>(
  {
    ListProps = {},
    PortalProps = {},
    inputValue: inputValueProp,
    highlightedItem: highlightedItemProp,
    selected: selectedProp,
    defaultInputValue,
    defaultSelected,
    disabled,
    variant = "primary",
    source,
    listRef: listRefProp,
    ListItem = DefaultListItem as unknown as ComboBoxNextProps<T>["ListItem"],
    itemFilter = defaultFilter as unknown as ComboBoxNextProps<T>["itemFilter"],
    onMouseOver,
    onBlur,
    onFocus,
    onKeyDown,
    onSelect,
    onListChange,
    onChange: onInputChange,
    ...rest
  }: ComboBoxNextProps<T>,
  ref?: ForwardedRef<HTMLInputElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-combo-box-next",
    css: comboBoxNextCss,
    window: targetWindow,
  });
  const listId = useId(ListProps?.id);
  const listRef = useRef<HTMLUListElement>(null);

  const setListRef = useForkRef(listRefProp, listRef);
  const listProps = {
    disabled,
    highlightedItem: highlightedItemProp,
    selected: selectedProp,
    defaultSelected,
    onChange: onListChange,
    onSelect: onSelect,
    id: listId,
    ref: listRef,
  };

  const {
    inputValue,
    setInputValue,
    portalProps,
    selectedItem,
    highlightedItem,
    activeDescendant,
    focusVisibleRef,
    keyDownHandler,
    focusHandler,
    blurHandler,
    setSelectedItem,
    setHighlightedItem,
    mouseOverHandler,
  } = useComboBox({
    defaultInputValue,
    inputValue: inputValueProp,
    onBlur,
    onFocus,
    onMouseOver,
    onKeyDown,
    listProps,
    PortalProps,
  });

  const {
    open,
    setOpen,
    floating,
    reference,
    getTriggerProps,
    getPortalProps,
    getPosition,
  } = portalProps;

  // floating references
  const triggerRef = useForkRef(ref, reference);
  const inputRef = useForkRef(triggerRef, focusVisibleRef);

  const { Component: FloatingComponent } = useFloatingComponent();

  const getFilteredSource = () => {
    if (!source) return null;
    if (selectedItem && inputValue === selectedItem) return source;
    return itemFilter && itemFilter(source, inputValue);
  };
  const filteredSource = getFilteredSource();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (value === "") {
      setHighlightedItem(undefined);
      setSelectedItem(value);
    } else {
      if (!open) {
        setOpen(true);
      }
      if (filteredSource) {
        setHighlightedItem(filteredSource[0] as unknown as string);
      }
    }
    onInputChange?.(event, { value: inputValue || "" });
  };

  const adornment = open ? (
    <ChevronUpIcon className={withBaseName("chevron")} />
  ) : (
    <ChevronDownIcon className={withBaseName("chevron")} />
  );

  const { className: listClassName, ...restListProps } = ListProps;
  const { className: inputClassName, ...restInputProps } = rest;

  return (
    <>
      <Input
        aria-controls={listId}
        aria-activedescendant={disabled ? undefined : activeDescendant}
        className={clsx(withBaseName("input"), inputClassName)}
        disabled={disabled}
        endAdornment={adornment}
        onChange={onChange}
        onBlur={blurHandler}
        inputRef={inputRef as Ref<HTMLInputElement>}
        inputProps={{
          "aria-expanded": open,
          tabIndex: disabled ? -1 : 0,
          onFocus: focusHandler,
          onKeyDown: keyDownHandler,
        }}
        role="combobox"
        variant={variant}
        value={inputValue}
        {...getTriggerProps()}
        {...restInputProps}
      />

      <FloatingComponent
        open={Boolean(open && filteredSource)}
        ref={floating}
        {...getPortalProps()}
        {...getPosition()}
      >
        <ListNext
          className={clsx(withBaseName("list"), listClassName)}
          disableFocus
          highlightedItem={highlightedItem}
          onMouseOver={mouseOverHandler}
          selected={selectedItem}
          {...restListProps}
          ref={setListRef}
        >
          {filteredSource.map((value, index) => {
            const onMouseDown = (event: SyntheticEvent<HTMLLIElement>) => {
              setSelectedItem(event.currentTarget?.dataset.value);
              setInputValue(event.currentTarget?.dataset.value);
            };
            return (
              ListItem && (
                <ListItem
                  key={index}
                  value={value}
                  matchPattern={inputValue}
                  onMouseDown={onMouseDown}
                />
              )
            );
          })}
        </ListNext>
      </FloatingComponent>
    </>
  );
});
