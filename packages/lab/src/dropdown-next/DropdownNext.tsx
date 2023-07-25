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
import { ChevronDownIcon } from "@salt-ds/icons";
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
      defaultSelected,
      selected: selectedProp,
      open: openProp,
      readOnly,
      source,
      onFocus,
      onKeyDown,
      onMouseDown,
      onBlur,
      style: dropdownStyle,
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
      mouseDownHandler,
      contextValue,
      listActiveDescendant,
      selectedItem,
      highlightedIndex,
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
      placement: "top-start",
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

    const handleSelect = (event: MouseEvent | KeyboardEvent) => {
      selectHandler(event);
      // onSelect?.(event);
    };

    const handleMouseDown = (event: MouseEvent<HTMLElement>) => {
      mouseDownHandler(event);
      onMouseDown?.(event);
    };

    return (
      <DropdownNextContext.Provider value={contextValue}>
        <div className={clsx(withBaseName(), className)}>
          <button
            id={dropdownId}
            disabled={disabled}
            onMouseDown={handleMouseDown}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
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
            // aria-labelledby="dropdownLabel" // identifies element that labels the DD
            tabIndex={disabled ? -1 : 0}
            aria-owns={listId} // see w3 managing focus...
            aria-controls={listId}
            // aria-activedescendant="" // listbox option with visual keyboard focus
            ref={triggerRef}
            style={dropdownStyle}
          >
            <span className={clsx(withBaseName("buttonText"), className)}>
              {selectedItem}
            </span>
            <span className={clsx(withBaseName("icon"), className)}>
              <ChevronDownIcon />
            </span>
          </button>

          {open && (
            <FloatingPortal>
              <SaltProvider>
                <div
                  className={clsx(withBaseName("popup"), className)}
                  {...getDropdownNextProps()}
                >
                  <ListNext
                    id={listId}
                    ref={floatingRef}
                    tabIndex={-1}
                    // className={clsx(withBaseName("list"), className)}
                    // aria-labelledby="dropdownLabel"
                    disabled={disabled}
                    selected={selectedItem}
                    onMouseDown={(evt) => {
                      console.log("list onMouseDown");
                      handleSelect(evt);
                    }}
                    // onKeyDown={(evt) => {
                    //   console.log("list onKeyDown");
                    //   handleSelect(evt);
                    // }}
                    highlightedIndex={highlightedIndex}
                    defaultSelected={defaultSelected}
                    displayedItemCount={6}
                  >
                    {getListItems(source, handleSelect)}
                  </ListNext>
                </div>
              </SaltProvider>
            </FloatingPortal>
          )}
        </div>
      </DropdownNextContext.Provider>
    );
  }
);
