import { clsx } from "clsx";
import { ListNext, ListNextProps } from "../list-next";
import {
  makePrefixer,
  useId,
  useForkRef,
  useFloatingComponent,
} from "@salt-ds/core";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import {
  useRef,
  forwardRef,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  Ref,
  ForwardedRef,
  SyntheticEvent,
  ComponentPropsWithoutRef,
} from "react";
import { useWindow } from "@salt-ds/window";
import dropdownNextCss from "./DropdownNext.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Placement } from "@floating-ui/react";
import { useDropdownNext } from "./useDropdownNext";

const withBaseName = makePrefixer("saltDropdownNext");

export interface DropdownNextProps
  extends Omit<ComponentPropsWithoutRef<"button">, "onSelect"> {
  /**
   * If `true`, dropdown will be disabled.
   */
  disabled?: boolean;
  /**
   * Initially selected value for the dropdown, for use only in uncontrolled component.
   */
  defaultSelected?: string;
  /**
   * List of options when using a dropdown.
   */
  source: string[];
  /**
   * If `true`, dropdown is read only.
   */
  readOnly?: boolean;
  /**
   * Background styling variant. Defaults to `primary` .
   */
  variant?: "primary" | "secondary";
  /**
   * Placement of dropdown list. Defaults to `bottom` .
   */
  placement?: Placement;
  /**
   * Optional ref for the list component.
   */
  listRef?: Ref<HTMLUListElement>;
  /**
   * Additional props for dropdown list.
   */
  ListProps?: ListNextProps;
  /* Status open or close for use in controlled component.  */
  open?: boolean;
  /**
   * Callback for list selection event
   */
  onSelect?: (event: SyntheticEvent, data: { value: string }) => void;
  /**
  /* Selected prop for use in controlled component. */
  selected?: string;
  /* Highlighted item prop for use in controlled component. */
  highlightedItem?: string;
}

export const DropdownNext = forwardRef(function DropdownNext(
  props: DropdownNextProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const {
    className,
    disabled,
    variant = "primary",
    id: dropdownIdProp,
    defaultSelected,
    readOnly,
    source,
    placement = "bottom",
    open: openControlProp,
    selected: selectedControlProp,
    highlightedItem: highlightedItemControlProp,
    onFocus,
    onKeyDown,
    onMouseOver,
    onMouseDown,
    onSelect,
    listRef: listRefProp,
    ListProps,
    ...restProps
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dropdown-next",
    css: dropdownNextCss,
    window: targetWindow,
  });

  const listId = useId(ListProps?.id);
  const dropdownId = useId(dropdownIdProp);
  const listRef = useRef<HTMLUListElement>(null);

  const setListRef = useForkRef(listRefProp, listRef);
  const listProps = {
    defaultSelected,
    disabled,
    ref: listRef,
    id: listId,
    onSelect: onSelect,
    selected: selectedControlProp,
    highlightedItem: highlightedItemControlProp,
  };

  const {
    handlers,
    activeDescendant,
    selectedItem,
    highlightedItem,
    getListItems,
    portalProps,
    getReferenceProps,
    refs,
  } = useDropdownNext({
    listProps,
    placement,
    openControlProp,
  });

  const { Component: FloatingComponent } = useFloatingComponent();

  const { open, floating, reference, getDropdownNextProps, getPosition } =
    portalProps;
  const {
    focusHandler,
    keyDownHandler,
    mouseOverHandler,
    mouseDownHandler,
    listSelectHandler,
  } = handlers;

  const triggerRef = useForkRef<HTMLButtonElement>(ref, reference);
  const portalRef = useForkRef<HTMLButtonElement>(ref, floating);

  const getIcon = () => {
    if (readOnly) return;

    const iconClassName = clsx(withBaseName("icon"), {
      [withBaseName("disabled")]: disabled,
    });

    return open ? (
      <ChevronUpIcon className={iconClassName} />
    ) : (
      <ChevronDownIcon className={iconClassName} />
    );
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (disabled) return;
    focusHandler(event);
    onFocus?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || readOnly) return;
    keyDownHandler(event);
    onKeyDown?.(event);
  };

  const handleMouseOver = (event: MouseEvent<HTMLButtonElement>) => {
    mouseOverHandler();
    onMouseOver?.(event);
  };

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || readOnly) return;
    mouseDownHandler();
    onMouseDown?.(event);
  };

  const handleListSelect = () => {
    listSelectHandler();
    (refs.domReference.current as HTMLButtonElement)?.focus();
  };

  return (
    <div className={clsx(withBaseName())}>
      <button
        id={dropdownId}
        disabled={disabled}
        {...getReferenceProps({
          onFocus: handleFocus,
          onMouseOver: handleMouseOver,
          onMouseDown: handleMouseDown,
          onKeyDown: handleKeyDown,
        })}
        value={selectedItem}
        className={clsx(
          withBaseName("button"),
          withBaseName(variant),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("readOnly")]: readOnly,
          },
          className
        )}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={activeDescendant}
        tabIndex={disabled ? -1 : 0}
        aria-owns={listId}
        aria-controls={listId}
        aria-disabled={disabled}
        {...restProps}
        ref={triggerRef}
      >
        <span className={clsx(withBaseName("buttonText"))}>{selectedItem}</span>
        {getIcon()}
      </button>
      <FloatingComponent
        open={open && !disabled}
        ref={portalRef}
        {...getDropdownNextProps()}
        {...getPosition()}
      >
        <ListNext
          id={listId}
          className={clsx(withBaseName("list"), ListProps?.className)}
          disableFocus
          disabled={disabled || ListProps?.disabled}
          selected={selectedItem}
          highlightedItem={highlightedItem}
          {...ListProps}
          ref={setListRef}
          onSelect={handleListSelect}
        >
          {getListItems(source)}
        </ListNext>
      </FloatingComponent>
    </div>
  );
});
