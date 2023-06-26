import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import {
  Children,
  cloneElement,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  FocusEvent,
} from "react";
import { clsx } from "clsx";
import { ListItemNext as DefaultListItem } from "./ListItemNext";
import { useList } from "./useList";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import listNextCss from "./ListNext.css";

const withBaseName = makePrefixer("saltListNext");

export interface ListNextProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
  /**
   * The component used to render a ListItem instead of the default. This must itself render a ListItem,
   * must implement props that extend ListItemProps and must forward ListItem props to the ListItem.
   */
  ListItem?: ReactElement;
  /**
   * Optional id prop
   *
   *The id for the list component
   */
  id?: string;
  /**
   * The number of items displayed in the visible area.
   * Note that this determines the max height of the list.
   */
  displayedItemCount?: number;
}

export const ListNext = forwardRef<HTMLUListElement, ListNextProps>(
  function ListNext(
    {
      children,
      className,
      disabled: listDisabled,
      displayedItemCount: displayedItemCountProp = 4,
      ListItem = DefaultListItem,
      id: idProp,
      onSelect,
      onFocus,
      onBlur,
      onKeyDown,
      onMouseDown,
      style,
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

    const childrenCount = Children.count(children);

    const listId = useId(idProp) || "listNext"; // TODO: check why useId needs to return undefined

    const displayedItemCount = Math.min(displayedItemCountProp, childrenCount);

    const {
      listRef,
      focusedIndex,
      selectedIndices,
      activeDescendant,
      handleClick,
      handleFocus,
      handleKeyDown,
      handleBlur,
      handleMouseDown,
    } = useList({
      children,
      displayedItemCount,
    });

    const forkedRef = useForkRef(ref, listRef);

    const renderContent = () => {
      return Children.map(children, (listItem, index) => {
        if (!isValidElement(listItem)) return;
        const { disabled: listItemDisabled, ...restListItemProps } =
          listItem.props as ListNextProps;
        const listItemProps = {
          ...restListItemProps,
          disabled: listItemDisabled || listDisabled,
          onClick: (e: MouseEvent<HTMLUListElement>) => handleClick(e),
          // focused is applicable for list items on focus using keyboard navigation only
          focused: focusedIndex === index,
          selected: selectedIndices.includes(index),
          id: `list-${listId}--list-item--${index}`,
        };

        return cloneElement(listItem, { ...listItemProps });
      });
    };
    const listStyles = {
      ...style,
      "--listNext-displayedItemCount": displayedItemCount,
    };

    const focusHandler = (event: FocusEvent<HTMLUListElement, Element>) => {
      handleFocus();
      onFocus?.(event);
    };

    const keyDownHandler = (event: KeyboardEvent<HTMLUListElement>) => {
      handleKeyDown(event);
      onKeyDown?.(event);
    };

    const blurHandler = (event: FocusEvent<HTMLUListElement, Element>) => {
      handleBlur();
      onBlur?.(event);
    };

    const mouseDownHandler = (
      event: MouseEvent<HTMLUListElement, globalThis.MouseEvent>
    ) => {
      handleMouseDown();
      onMouseDown?.(event);
    };

    return (
      <ul
        ref={forkedRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("focusable")]: !childrenCount,
          },
          className
        )}
        role="listbox"
        tabIndex={listDisabled ? -1 : 0}
        aria-activedescendant={listDisabled ? undefined : activeDescendant}
        style={listStyles}
        onFocus={focusHandler}
        onKeyDown={keyDownHandler}
        onBlur={blurHandler}
        onMouseDown={mouseDownHandler}
        {...rest}
      >
        {renderContent()}
      </ul>
    );
  }
);
