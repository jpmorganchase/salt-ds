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
      ...rest
    },
    ref
  ) {
    const emptyList = Children.count(children) === 0;

    // const { selectedIdxs, focusedIndex, listRef, handleClick } = useList({
    const { listRef } = useList({
      children,
      deselectable,
      multiselect,
      displayedItemCount,
      onFocus
    });
    const forkedRef = useForkRef(ref, listRef);

    function renderEmpty() {
      return (
        <ListItemNext
          className={withBaseName("empty-message")}
          role="presentation"
        >
          {emptyMessage || defaultEmptyMessage}
        </ListItemNext>
      );
    }

    function renderContent() {
      return Children.map(children, (listItem, index) => {
        const { disabled: propDisabled, ...rest} = listItem.props;
        const childProps = {
          showCheckbox: multiselect,
          disabled: propDisabled || disabled,
          // onClick: (e) => handleClick(e, index),
          // focused: focusedIndex === index,
          // selected: selectedIdxs.includes(index),
          // tabIndex: focusedIndex === index,
          id: index, // TODO: Check this
          ...rest,
        };
        return (
          isValidElement(listItem) &&
          cloneElement(listItem, childProps)
        );
      });
    }

    return (
      <ul
        ref={forkedRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("borderless")]: borderless,
          },
          className
        )}
        role="listbox"
        tabIndex={disabled? undefined : 0}
        // aria-activedescendant={selectedIndex}
        style={{}}
        {...rest}
      >
        {emptyList ? renderEmpty() : renderContent()}
      </ul>
    );
  }
);
