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
  /**
   * Optional id prop
   *
   *The id for the list component
   */
  id?: string;
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
      disabled: listDisabled,
      id,
      onSelect,
      onFocus,
      onBlur,
      onKeyDown,
      onMouseDown,
      selected: selectedProp,
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

    const {
      handleFocus,
      handleKeyDown,
      handleBlur,
      handleMouseDown,
      activeDescendant,
      contextValue,
    } = useList({
      disabled: listDisabled,
      selected: selectedProp,
      defaultSelected,
      id: listId,
      ref: listRef,
    });

    const focusHandler = (event: FocusEvent<HTMLUListElement>) => {
      handleFocus();
      onFocus?.(event);
    };

    const keyDownHandler = (event: KeyboardEvent<HTMLUListElement>) => {
      handleKeyDown(event);
      onKeyDown?.(event);
    };

    const blurHandler = (event: FocusEvent<HTMLUListElement>) => {
      handleBlur();
      onBlur?.(event);
    };

    const mouseDownHandler = (event: MouseEvent<HTMLUListElement>) => {
      handleMouseDown();
      onMouseDown?.(event);
    };

    return (
      <ListNextContext.Provider value={contextValue}>
        <ul
          ref={handleRef}
          id={listId}
          className={clsx(withBaseName(), className)}
          role="listbox"
          tabIndex={listDisabled ? -1 : 0}
          aria-activedescendant={listDisabled ? undefined : activeDescendant}
          onFocus={focusHandler}
          onKeyDown={keyDownHandler}
          onBlur={blurHandler}
          onMouseDown={mouseDownHandler}
          {...rest}
        >
          {children}
        </ul>
      </ListNextContext.Provider>
    );
  }
);
