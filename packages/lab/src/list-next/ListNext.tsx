import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
  useRef,
} from "react";
import listNextCss from "./ListNext.css";
import { ListNextContext } from "./ListNextContext";
import { useList } from "./useList";

const withBaseName = makePrefixer("saltListNext");

export interface ListNextProps
  extends Omit<ComponentPropsWithoutRef<"ul">, "onChange" | "onSelect"> {
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
  /* If `true`, the component will not receive focus. */
  disableFocus?: boolean;
  /* Value for the controlled version. */
  highlightedItem?: string;
  /* Value for the controlled version. */
  selected?: string;
  /* Callback for change event. Returns current selection.*/
  onChange?: (
    event: SyntheticEvent,
    data: { value: string | undefined },
  ) => void;
  /* Callback for select event. Returns new selected item.*/
  onSelect?: (event: SyntheticEvent, data: { value: string }) => void;
  /* Initial selection. */
  defaultSelected?: string;
}

export const ListNext = forwardRef<HTMLUListElement, ListNextProps>(
  function ListNext(
    {
      children,
      className,
      disabled,
      disableFocus,
      id,
      onSelect,
      onFocus,
      onBlur,
      onKeyDown,
      onMouseOver,
      highlightedItem,
      selected,
      defaultSelected,
      onChange,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-list-next",
      css: listNextCss,
      window: targetWindow,
    });

    const listId = useId(id);
    const listRef = useRef<HTMLUListElement>(null);
    const handleRef = useForkRef(listRef, ref);
    const {
      focusHandler,
      keyDownHandler,
      blurHandler,
      mouseOverHandler,
      activeDescendant,
      contextValue,
      focusVisibleRef,
    } = useList({
      disabled,
      highlightedItem,
      selected,
      defaultSelected,
      onChange,
      onSelect,
      id: listId,
      ref: listRef,
    });

    const setListRef = useForkRef(focusVisibleRef, handleRef);

    const handleFocus = (event: FocusEvent<HTMLUListElement>) => {
      focusHandler(event);
      onFocus?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
      if (disableFocus) {
        event.preventDefault();
        return;
      }
      keyDownHandler(event);
      onKeyDown?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLUListElement>) => {
      blurHandler();
      onBlur?.(event);
    };

    const handleMouseOver = (event: MouseEvent<HTMLUListElement>) => {
      mouseOverHandler();
      onMouseOver?.(event);
    };

    return (
      <ListNextContext.Provider value={contextValue}>
        <ul
          // TODO: fix type from useIsFocusVisible
          // @ts-expect-error
          ref={setListRef}
          id={listId}
          className={clsx(withBaseName(), className)}
          role="listbox"
          tabIndex={disabled || disableFocus ? -1 : 0}
          aria-activedescendant={disabled ? undefined : activeDescendant}
          aria-disabled={disabled}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onMouseOver={handleMouseOver}
          {...rest}
        >
          {children}
        </ul>
      </ListNextContext.Provider>
    );
  },
);
