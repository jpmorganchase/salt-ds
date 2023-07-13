import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import {
  FocusEvent,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  useRef,
} from "react";
import { clsx } from "clsx";
import { useList } from "./useList";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import listNextCss from "./ListNext.css";
import { ListNextContext } from "./ListNextContext";

const withBaseName = makePrefixer("saltListNext");

export interface ListNextProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
  /* Value for the uncontrolled version. */
  highlightedIndex?: number;
  /* Value for the uncontrolled version. */
  selected?: string;
  /* Initial value for the uncontrolled version. */
  defaultSelected?: string;
}

export const ListNext = forwardRef<HTMLUListElement, ListNextProps>(
  function ListNext(
    {
      children,
      className,
      disabled,
      id,
      onSelect,
      onFocus,
      onBlur,
      onKeyDown,
      onMouseDown,
      highlightedIndex,
      selected,
      defaultSelected,
      ...rest
    },
    ref
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
    const controlled = Boolean(selected || highlightedIndex);
    const {
      focusHandler,
      keyDownHandler,
      blurHandler,
      mouseDownHandler,
      activeDescendant,
      contextValue,
    } = useList({
      disabled,
      highlightedIndex,
      selected,
      defaultSelected,
      id: listId,
      ref: listRef,
    });

    const handleFocus = (event: FocusEvent<HTMLUListElement>) => {
      focusHandler();
      onFocus?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
      keyDownHandler(event);
      onKeyDown?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLUListElement>) => {
      blurHandler();
      onBlur?.(event);
    };

    const handleMouseDown = (event: MouseEvent<HTMLUListElement>) => {
      mouseDownHandler();
      onMouseDown?.(event);
    };

    return (
      <ListNextContext.Provider value={contextValue}>
        <ul
          ref={handleRef}
          id={listId}
          className={clsx(withBaseName(), className)}
          role="listbox"
          tabIndex={disabled || controlled ? -1 : 0}
          aria-activedescendant={disabled ? undefined : activeDescendant}
          aria-disabled={disabled}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onMouseDown={handleMouseDown}
          {...rest}
        >
          {children}
        </ul>
      </ListNextContext.Provider>
    );
  }
);
