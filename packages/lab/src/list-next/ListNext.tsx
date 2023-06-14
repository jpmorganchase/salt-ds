import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import {
  Children,
  cloneElement,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  KeyboardEventHandler,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  useMemo,
} from "react";
import { clsx } from "clsx";
import { ListItemNext as DefaultListItem } from "./ListItemNext";
import { useList } from "./useList";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import listNextCss from "./ListNext.css";

const withBaseName = makePrefixer("saltListNext");
const defaultEmptyMessage = "No data to display";

export interface ListNextProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
  /**
   * Use to override the default empty message.
   */
  emptyMessage?: string;
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
  // ListNextControlProps
  onBlur?: FocusEventHandler;
  onFocus?: FocusEventHandler;
  onKeyDown?: KeyboardEventHandler;
  onMouseDown?: MouseEventHandler;
}

export const ListNext = forwardRef<HTMLUListElement, ListNextProps>(
  function ListNext(
    {
      children,
      className,
      disabled: listDisabled,
      displayedItemCount: displayedItemCountProp,
      ListItem = DefaultListItem,
      emptyMessage = defaultEmptyMessage,
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
    const emptyList = childrenCount === 0;

    const listId = useId(idProp) || "listNext"; // TODO: check why useId needs to return undefined

    const displayedItemCount = useMemo((): number => {
      // if no children, display empty message
      if (emptyList) return 1;

      // displayedItemCount takes precedence over childrenCount
      if (displayedItemCountProp)
        return Math.min(displayedItemCountProp, childrenCount);

      // if more than 4 children, display 4 tops
      return Math.min(4, childrenCount);
    }, [displayedItemCountProp, childrenCount, emptyList]);

    const {
      listRef,
      focusedIndex,
      selectedIndexes,
      activeDescendant,
      handleClick,
    } = useList({
      children,
      displayedItemCount,
      onFocus,
      onKeyDown,
      onBlur,
      onMouseDown,
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
          selected: selectedIndexes.includes(index),
          id: `list-${listId}--list-item--${index}`,
        };

        return cloneElement(listItem, { ...listItemProps });
      });
    };
    const listStyles = {
      ...style,
      "--listNext-displayedItemCount": displayedItemCount,
      "--listNext-emptyMessage": emptyMessage && `"${emptyMessage}"`,
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
        aria-label={emptyList && emptyMessage}
        aria-activedescendant={listDisabled ? undefined : activeDescendant}
        style={listStyles}
        {...rest}
      >
        {!emptyList && renderContent()}
      </ul>
    );
  }
);
