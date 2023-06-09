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
import {
  ListItemNext,
  ListItemNext as DefaultListItem,
} from "./ListItemNext";
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
   * If `true`, the component will have no border.
   */
  borderless?: boolean;
  /**
   * If `true`, items in list will be deselectable.
   */
  deselectable?: boolean;
  /**
   * Optional id prop
   *
   * Used as suffix of List id: `list-{id}`
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
      borderless,
      children,
      className,
      disabled: disabledListProp,
      displayedItemCount: displayedItemCountProp,
      deselectable = false,
      ListItem = DefaultListItem,
      emptyMessage,
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
    const selectedDisabled =
      Children.toArray(children).findIndex(
        (child) =>
          isValidElement(child) && child.props.disabled && child.props.selected
      ) !== -1;
    const disabled = disabledListProp || selectedDisabled;
    const listId = useId(idProp) || 'listNext'; // TODO: check why useId needs to return undefined

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
      deselectable,
      displayedItemCount,
      onFocus,
      onKeyDown,
      onBlur,
      onMouseDown,
    });

    const forkedRef = useForkRef(ref, listRef);

    function renderEmpty() {
      return (
        <ListItemNext role="presentation" value="emptyMessage">
          {emptyMessage || defaultEmptyMessage}
        </ListItemNext>
      );
    }

    const renderContent = () => {
      return Children.map(children, (listItem, index) => {
        if (!isValidElement(listItem)) return;
        const { disabled: propDisabled, ...restListItemProps } = listItem.props;
        const listItemProps = {
          ...restListItemProps,
          disabled: propDisabled || disabled,
          onClick: (e: MouseEvent<HTMLUListElement>) => handleClick(e),
          focused: focusedIndex === index,
          selected: selectedIndexes.includes(index),
          id: `list-${listId}--list-item--${index}`,
        };

        return cloneElement(listItem, { ...listItemProps });
      });
    };
    const listStyles = {
      ...style,
      "--list-displayedItemCount": displayedItemCount,
    };

    return (
      <ul
        ref={forkedRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("borderless")]: borderless,
            [withBaseName("focusable")]: !childrenCount,
          },
          className
        )}
        role="listbox"
        tabIndex={disabled ? -1 : 0}
        aria-activedescendant={disabled ? undefined : activeDescendant}
        style={listStyles}
        {...rest}
      >
        {emptyList ? renderEmpty() : renderContent()}
      </ul>
    );
  }
);
