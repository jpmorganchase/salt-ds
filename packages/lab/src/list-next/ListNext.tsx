import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import {
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  SyntheticEvent,
  useMemo,
  useRef,
} from "react";
import { clsx } from "clsx";
import { useList } from "./useList";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import listNextCss from "./ListNext.css";
import { ListNextContext } from "./ListNextContext";

const withBaseName = makePrefixer("saltListNext");

export interface ListNextProps
  extends Omit<ComponentPropsWithoutRef<"ul">, "onChange"> {
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
  /* If `true`, the component will not receive focus. */
  disableFocus?: boolean;
  /* Value for the controlled version. */
  highlightedIndex?: number;
  /* Value for the controlled version. */
  selected?: string;
  /* Callback for the controlled version. */
  onChange?: (e: SyntheticEvent, data: { value: string }) => void;
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
      onMouseDown,
      highlightedIndex,
      selected,
      defaultSelected,
      onChange,
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
      onChange,
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
          tabIndex={disabled || disableFocus ? -1 : 0}
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
