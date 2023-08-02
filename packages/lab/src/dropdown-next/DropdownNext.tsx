import { clsx } from "clsx";
import { ListNext, ListNextProps } from "@salt-ds/lab";
import {
  makePrefixer,
  useId,
  useForkRef,
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
} from "react";
import { useWindow } from "@salt-ds/window";
import dropdownNextCss from "./DropdownNext.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { DropdownNextContext } from "./DropdownNextContext";
import { FloatingPortal, Placement } from "@floating-ui/react";
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
  /**
   * List of options when using a dropdown. Accepts string or object with `id`, `value` and `disabled`.
   */
  source: T[];
  /**
   * If `true`, dropdown is read only.
   */
  readOnly?: boolean;
  /**
   * Background styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
   * Placement of dropdown list. Defaults to 'bottom'.
   */
  placement?: Placement;
  /**
   * Props for dropdown list.
   */
  ListProps?: ListNextProps;
  /**
   * Props for controlled dropdown.
   */
  open?: boolean;
  selected?: T;
}

export const DropdownNext = forwardRef<HTMLDivElement, DropdownNextProps<T>>(
  function DropdownNext(props, ref) {
    const {
      className,
      disabled,
      variant = "primary",
      id: dropdownIdProp,
      defaultSelected,
      readOnly,
      source,
      placement = "bottom",
      open: openProp,
      onFocus,
      onKeyDown,
      onBlur,
      onMouseOver,
      onClick,
      style: dropdownStyle,
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

    const {
      focusHandler,
      keyDownHandler,
      blurHandler,
      mouseOverHandler,
      mouseDownHandler,
      contextValue,
      activeDescendant,
      selectedItem,
      setSelectedItem,
      highlightedItem,
      setHighlightedItem,
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
      openProp,
    });

    const triggerRef = useForkRef(
      ref,
      reference
    ) as MutableRefObject<HTMLButtonElement>;

    const floatingListRef = useForkRef(
      listRef,
      floating
    ) as MutableRefObject<HTMLUListElement>;

    const getIcon = () => {
      const iconClassName = clsx(
        withBaseName("icon"),
        {
          [withBaseName("disabled")]: disabled,
        },
        className
      );

      return readOnly ? (
        ""
      ) : open ? (
        <ChevronUpIcon className={iconClassName} />
      ) : (
        <ChevronDownIcon className={iconClassName} />
      );
    };

    const handleFocus = (event: FocusEvent<HTMLElement>) => {
      if (disabled || readOnly) return;

      focusHandler(event);
      onFocus?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled || readOnly) return;

      keyDownHandler(event);
      onKeyDown?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLElement>) => {
      blurHandler();
      onBlur?.(event);
    };

    const handleMouseOver = (event: MouseEvent<HTMLElement>) => {
      mouseOverHandler();
      onMouseOver?.(event);
    };

    const handleMouseDown = (event: MouseEvent<HTMLElement>) => {
      if (disabled || readOnly) return;
      mouseDownHandler();
      onClick?.(event);
    };

    return (
      <div className={clsx(withBaseName(), className)}>
        <button
          id={dropdownId}
          disabled={disabled}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onMouseOver={handleMouseOver}
          onMouseDown={handleMouseDown}
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
          tabIndex={disabled ? -1 : 0}
          aria-owns={listId}
          aria-controls={listId}
          aria-disabled={disabled}
          style={dropdownStyle}
          {...restProps}
          ref={triggerRef}
        >
          <span className={clsx(withBaseName("buttonText"), className)}>
            {selectedItem}
          </span>
          {getIcon()}
        </button>
        {open && (
          <FloatingPortal>
            <SaltProvider>
              <div {...getDropdownNextProps()}>
                <ListNext
                  id={listId}
                  className={clsx(withBaseName("list"), ListProps?.className)}
                  disableFocus
                  disabled={disabled || ListProps?.disabled}
                  selected={selectedItem}
                  highlightedItem={highlightedItem}
                  onMouseOver={handleMouseOver}
                  {...ListProps}
                  ref={floatingListRef}
                >
                  {getListItems(source)}
                </ListNext>
              </div>
            </SaltProvider>
          </FloatingPortal>
        )}
      </div>
    );
  }
);
