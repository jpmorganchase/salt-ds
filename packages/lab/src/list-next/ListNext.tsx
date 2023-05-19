import { makePrefixer, mergeProps, useForkRef } from "@salt-ds/core";
import {
  Children,
  cloneElement,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
} from "react";
import "./ListNext.css";
import { clsx } from "clsx";
import { ListItemNext, ListItemNext as DefaultListItem } from "./ListItemNext";
import { useList } from "./useList";

const withBaseName = makePrefixer("saltList");
const defaultEmptyMessage = "No data to display";

export interface ListNextProps extends HTMLAttributes<HTMLUListElement> {
  disabled?: boolean;
  emptyMessage?: string;
  multiselect?: boolean;
  ListItem?: ReactElement;
  borderless?: boolean;
  deselectable?: boolean;
  displayedItemCount?: number;
}

export interface ListNextControlProps {
  "aria-activedescendant"?: string;
  onBlur: FocusEventHandler;
  onFocus: FocusEventHandler;
  onKeyDown: KeyboardEventHandler;
  onMouseDownCapture: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
}

export const ListNext = forwardRef<HTMLUListElement, ListNextProps>(
  function ListNext(
    {
      borderless,
      children,
      className,
      disabled,
      displayedItemCount,
      deselectable,
      ListItem = DefaultListItem,
      emptyMessage,
      multiselect,
      onSelect,
      onFocus,
      style,
      ...rest
    },
    ref
  ) {
    const emptyList = Children.count(children) === 0;

    const {
      listRef,
      focusedIndex,
      selectedIndexes,
      activeDescendant,
      handleClick,
    } = useList({
      children,
      deselectable,
      multiselect,
      displayedItemCount,
      onFocus,
    });
    const forkedRef = useForkRef(ref, listRef);

    function renderEmpty() {
      return (
        <ListItemNext
          className={withBaseName("emptyMessage")}
          role="presentation"
        >
          {emptyMessage || defaultEmptyMessage}
        </ListItemNext>
      );
    }

    function renderContent() {
      return Children.map(children, (listItem, index) => {
        const { disabled: propDisabled, ...rest } = listItem.props;
        const childProps = {
          showCheckbox: multiselect,
          disabled: propDisabled || disabled,
          onClick: (e) => handleClick(e, index),
          focused: focusedIndex === index,
          selected: selectedIndexes.includes(index),
          // tabIndex: focusedIndex === index,
          id: index, // TODO: Check this
          ...rest,
        };

        return isValidElement(listItem) && cloneElement(listItem, childProps);
      });
    }

    const childrenCount = Children.count(children);
    const getDisplayedItemCount = () => {
      // if no children, display empty message
      if (emptyList) return 1;

      // displayedItemCount takes precedence over childrenCount
      if (displayedItemCount)
        return displayedItemCount <= childrenCount
          ? displayedItemCount
          : childrenCount;

      // if more than 4 children, display 4 tops
      return childrenCount > 4 ? 4 : childrenCount;
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
        tabIndex={disabled ? undefined : 0}
        aria-activedescendant={activeDescendant}
        style={{
          ...style,
          "--list-displayedItemCount": getDisplayedItemCount(),
        }}
        {...rest}
      >
        {emptyList ? renderEmpty() : renderContent()}
      </ul>
    );
  }
);
