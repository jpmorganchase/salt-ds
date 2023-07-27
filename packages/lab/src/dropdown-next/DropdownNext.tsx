import { clsx } from "clsx";
import { ListItemNext, ListNext, ListNextProps } from "@salt-ds/lab";
import {
  makePrefixer,
  useId,
  useForkRef,
  useFloatingUI,
  UseFloatingUIProps,
  SaltProvider,
} from "@salt-ds/core";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import {
  useRef,
  forwardRef,
  HTMLAttributes,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  MutableRefObject,
  ChangeEvent,
} from "react";
import { useWindow } from "@salt-ds/window";
import dropdownNextCss from "./DropdownNext.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { DropdownNextContext } from "./DropdownNextContext";
import { FloatingPortal } from "@floating-ui/react";
import { useDropdownNext } from "./useDropdownNext";

const withBaseName = makePrefixer("saltDropdownNext");

export interface DropdownNextProps<T>
  extends Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement">,
    HTMLAttributes<HTMLElement> {
  /**
   * If true, dropdown will be disabled.
   */
  disabled?: boolean;
  /**
   * Initially selected value for the dropdown.
   */
  defaultSelected?: string;
  selected?: string;
  open?: boolean;
  listId?: string;
  /**
   * List item count to display. Defaults to 10.
   */
  displayedItemCount?: number;
  /**
   * Background styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
   * List of items when using a Dropdown.
   */
  source: T[];
  ListProps?: ListNextProps;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
}

export const DropdownNext = forwardRef<HTMLDivElement, DropdownNextProps<T>>(
  function DropdownNext(props, ref) {
    const {
      className,
      disabled,
      variant = "primary",
      id: dropdownIdProp,
      listId: listIdProp,
      displayedItemCount = 10,
      defaultSelected,
      selected: selectedProp,
      open: openProp,
      readOnly,
      source,
      placement = "bottom",
      onFocus,
      onKeyDown,
      onBlur,
      onMouseOver,
      style: dropdownStyle,
      ListProps,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dropdown-next",
      css: dropdownNextCss,
      window: targetWindow,
    });

    const listId = useId(listIdProp);
    const dropdownId = useId(dropdownIdProp);
    const listRef = useRef<HTMLUListElement>(null);

    const {
      focusHandler,
      keyDownHandler,
      blurHandler,
      mouseOverHandler,
      contextValue,
      activeDescendant,
      selectedItem,
      highlightedItem,
      setListRef,
      getListItems,
      open,
      setOpen,
      floating,
      reference,
      getDropdownNextProps,
    } = useDropdownNext({
      source,
      defaultSelected,
      disabled,
      listRef,
      listId,
      placement,
    });

    const triggerRef = useForkRef(
      ref,
      reference
    ) as MutableRefObject<HTMLButtonElement>;

    const floatingRef = useForkRef(
      listRef,
      floating
    ) as MutableRefObject<HTMLUListElement>;

    const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
      if (disabled || readOnly) return;

      focusHandler(event);
      onFocus?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      keyDownHandler(event);
      onKeyDown?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLElement>) => {
      blurHandler(event);
      onBlur?.(event);
    };

    const handleMouseOver = (event: MouseEvent<HTMLElement>) => {
      mouseOverHandler(event);
      onMouseOver?.(event);
    };

    return (
      <DropdownNextContext.Provider value={contextValue}>
        <div className={clsx(withBaseName(), className)}>
          <button
            id={dropdownId}
            disabled={disabled}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onMouseOver={handleMouseOver}
            onBlur={handleBlur}
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
            aria-activedescendant={disabled ? undefined : activeDescendant}
            // aria-labelledby="dropdownLabel" // identifies element that labels the DD
            tabIndex={disabled ? -1 : 0}
            aria-owns={listId}
            aria-controls={listId}
            ref={triggerRef}
            style={dropdownStyle}
          >
            <span className={clsx(withBaseName("buttonText"), className)}>
              {selectedItem}
            </span>
            {open && readOnly === false ? (
              <ChevronUpIcon
                className={clsx(
                  withBaseName("icon"),
                  {
                    [withBaseName("disabled")]: disabled,
                    [withBaseName("readOnly")]: readOnly,
                  },
                  className
                )}
              />
            ) : (
              <ChevronDownIcon
                className={clsx(
                  withBaseName("icon"),
                  {
                    [withBaseName("disabled")]: disabled,
                    [withBaseName("readOnly")]: readOnly,
                  },
                  className
                )}
              />
            )}
          </button>

          {open && (
            <FloatingPortal>
              <div
                className={clsx(withBaseName("popup"), className)}
                {...getDropdownNextProps()}
              >
                <ListNext
                  id={listId}
                  disableFocus
                  // aria-labelledby="dropdownLabel"
                  disabled={disabled}
                  selected={selectedItem}
                  highlightedItem={highlightedItem}
                  // onFocus={handleFocus}
                  onMouseOver={handleMouseOver}
                  displayedItemCount={displayedItemCount}
                  {...ListProps}
                  ref={floatingRef}
                >
                  {getListItems(source)}
                </ListNext>
              </div>
            </FloatingPortal>
          )}
        </div>
      </DropdownNextContext.Provider>
    );
  }
);
