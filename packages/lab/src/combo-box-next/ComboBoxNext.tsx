import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  Ref,
  SyntheticEvent,
  useRef,
} from "react";
import {
  Input,
  makePrefixer,
  SaltProvider,
  useForkRef,
  useId,
} from "@salt-ds/core";
import { ListNext, ListNextProps } from "../list-next";
import { FloatingPortal } from "@floating-ui/react";
import { useComboBox } from "./useComboBox";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import comboBoxNextCss from "./ComboBoxNext.css";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { DefaultListItem, defaultFilter } from "./utils";
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
   * Controlled prop. Controls the value for the Combo Box input.
   */
  value?: string;
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
  defaultValue?: string;
  /**
   * Initial selected value for when the list is uncontrolled.
   */
  defaultSelected?: string;
  /**
   * If `true`, the component will be disabled.
   */
  disabled: boolean;
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
   * The source of combobox items.
   */
  source: T[];
  /**
   * Optional ref for the input component
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Optional ref for the list component
   */
  listRef?: Ref<HTMLUListElement>;
  /**
   * The component used for item instead of the default.
   */
  ListItem: any;
  /**
   * Function to be used as filter.
   */
  itemFilter?: (source: T[], filterValue?: string) => T[];
  /**
   * Callback for blur event
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback for focus event
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback for keyDown event
   */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /**
   * Callback for mouse over event
   */
  onMouseOver?: (event: SyntheticEvent) => void;
  /**
   * Callback fired when item is selected.
   */
  onSelect?: (
    event: SyntheticEvent<HTMLInputElement>,
    data: { value?: string }
  ) => void;
  /**
   * Callback for input change event
   */
  onInputChange?: (
    event: ChangeEvent<HTMLInputElement>,
    data: { value: string }
  ) => void;
}

export const ComboBoxNext = forwardRef(function ComboBoxNext<T>(
  {
    ListProps = {},
    PortalProps = {},
    highlightedItem: highlightedItemProp,
    value,
    selected,
    defaultValue,
    defaultSelected,
    disabled,
    onKeyDown,
    onSelect,
    onBlur,
    onFocus,
    onMouseOver,
    onInputChange: onInputChangeProp,
    source,
    variant,
    ListItem = DefaultListItem,
    itemFilter = defaultFilter as unknown as ComboBoxNextProps<T>["itemFilter"],
    listRef: listRefProp,
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
  const {
    id: listPropsId,
    onChange: onListChange,
    className: listClassName,
    ...restListProps
  } = ListProps;
  const { className: inputClassName, ...restInputProps } = rest;

  const listId = useId(listPropsId);
  const listRef = useRef<HTMLUListElement>(null);
  const setListRef = useForkRef(listRefProp, listRef);

  const listHookProps = {
    highlightedItem: highlightedItemProp,
    selected,
    defaultSelected,
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
    value,
    onBlur,
    onFocus,
    onMouseOver,
    onKeyDown,
    onSelect,
    listHookProps,
    PortalProps,
  });

  const {
    open,
    setOpen,
    floating,
    reference,
    getTriggerProps,
    getPortalProps,
  } = portalProps;

  // floating references
  const triggerRef = useForkRef(ref, reference);
  const inputRef = useForkRef(triggerRef, focusVisibleRef);

  const getFilteredSource = () => {
    if (!source) return null;
    if (selectedItem) return source;
    return itemFilter && itemFilter(source, inputValue);
  };
  const filteredSource = getFilteredSource();
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    onInputChangeProp?.(event, { value });
  };

  const adornment = open ? (
    <ChevronUpIcon className={withBaseName("chevron")} />
  ) : (
    <ChevronDownIcon className={withBaseName("chevron")} />
  );

  return (
    <>
      <Input
        aria-controls={listId}
        aria-activedescendant={disabled ? undefined : activeDescendant}
        className={clsx(withBaseName("input"), inputClassName)}
        disabled={disabled}
        endAdornment={adornment}
        inputRef={inputRef as Ref<HTMLInputElement>}
        inputProps={{
          "aria-expanded": open,
          tabIndex: disabled ? -1 : 0,
          onFocus: focusHandler,
          onBlur: blurHandler,
          onKeyDown: keyDownHandler,
          onChange: onInputChange,
        }}
        role="combobox"
        variant={variant}
        value={inputValue}
        {...getTriggerProps()}
        {...restInputProps}
      />
      {open && filteredSource && (
        <FloatingPortal>
          {/* The provider is needed to support the use case where an app has nested modes. The portal element needs to have the same style as the current scope */}
          <SaltProvider>
            <div ref={floating} {...getPortalProps()}>
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
                  const onMouseDown = (
                    event: SyntheticEvent<HTMLLIElement>
                  ) => {
                    setSelectedItem(event.currentTarget?.dataset.value);
                    setInputValue(event.currentTarget?.dataset.value);
                  };
                  return (
                    <ListItem
                      key={index}
                      value={value}
                      matchPattern={inputValue}
                      onMouseDown={onMouseDown}
                    />
                  );
                })}
              </ListNext>
            </div>
          </SaltProvider>
        </FloatingPortal>
      )}
    </>
  );
});
