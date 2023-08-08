import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  ReactNode,
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
  InputProps,
} from "@salt-ds/core";
import { ListNext, ListNextProps } from "../list-next";
import { FloatingPortal } from "@floating-ui/react";
import { useComboBox } from "./useComboBox";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import comboBoxNextCss from "./ComboBoxNext.css";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { defaultFilter, defaultItemRenderer } from "./utils";
import { clsx } from "clsx";
import { UseComboBoxPortalProps } from "./useComboboxPortal";

const withBaseName = makePrefixer("saltComboBoxNext");

export interface ComboBoxNextProps<T>
  extends Omit<ComponentPropsWithoutRef<"input">, "onChange"> {
  /**
   * Additional props for the input component.
   */
  InputProps?: InputProps;
  /**
   * Additional props for the list component.
   */
  ListProps?: ListNextProps;
  /**
   * Additional props for the portal.
   */
  PortalProps?: UseComboBoxPortalProps;
  /**
   * If `true`, the component will be disabled.
   */
  disabled: boolean;
  /* Highlighted index for when the list is controlled. */
  highlightedItem?: string;
  /* Selected value for when the list is controlled. */
  selected?: string;
  /* Initial selected value for when the list is controlled. */
  defaultSelected?: string;
  /**
   * The source of combobox items.
   */
  source: T[];
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
   * Optional ref for the input component
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Optional ref for the list component
   */
  listRef?: Ref<HTMLUListElement>;
  /**
   * Item renderer function.
   */
  itemRenderer?: (
    key: number,
    value?: T,
    matchPattern?: string,
    onMouseDown?: (event: SyntheticEvent<HTMLLIElement>) => void
  ) => ReactNode | null | undefined;
  /**
   * Function to be used as filter.
   */
  itemFilter?: (source: T[], filterValue?: string) => T[];
  /* Callback for change event in input. */
  onChange?: (event: SyntheticEvent, data: { value: string }) => void;
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
}

export const ComboBoxNext = forwardRef(function ComboBoxNext<T>(
  {
    InputProps = {},
    ListProps = {},
    PortalProps = {},
    disabled,
    highlightedItem: highlightedItemProp,
    selected,
    defaultSelected,
    onKeyDown,
    onChange,
    onBlur,
    onFocus,
    onMouseOver,
    source,
    itemRenderer = defaultItemRenderer as unknown as ComboBoxNextProps<T>["itemRenderer"],
    itemFilter = defaultFilter as unknown as ComboBoxNextProps<T>["itemFilter"],
    variant = "primary",
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
  const listId = useId(ListProps?.id);
  const listRef = useRef<HTMLUListElement>(null);

  const setListRef = useForkRef(listRefProp, listRef);
  const listProps = {
    highlightedItem: highlightedItemProp,
    selected,
    defaultSelected,
    onChange,
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
    onChange?.(event, { value: inputValue || "" });
  };

  const adornment = open ? (
    <ChevronUpIcon className={withBaseName("chevron")} />
  ) : (
    <ChevronDownIcon className={withBaseName("chevron")} />
  );

  const { className: listClassName, ...restListProps } = ListProps;
  const { className: inputClassName, ...restInputProps } = InputProps;

  return (
    <>
      <Input
        aria-controls={listId}
        aria-activedescendant={disabled ? undefined : activeDescendant}
        className={clsx(withBaseName("input"), inputClassName)}
        disabled={disabled}
        endAdornment={adornment}
        onChange={onInputChange}
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
                  return (
                    itemRenderer &&
                    itemRenderer(index, value, inputValue, (event) => {
                      setSelectedItem(event.currentTarget?.dataset.value);
                      setInputValue(event.currentTarget?.dataset.value);
                    })
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
