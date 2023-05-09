import {makePrefixer, mergeProps, useForkRef} from "@salt-ds/core";
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
import {clsx} from "clsx";
import {ListItemNext, ListItemNext as DefaultListItem} from "./ListItemNext";
import {useList} from "./useList";

const withBaseName = makePrefixer("saltList");
const defaultEmptyMessage = "No data to display";

export interface ListNextProps extends HTMLAttributes<HTMLUListElement> {
  disabled?: boolean;
  emptyMessage?: string;
  multiselect?: boolean;
  ListItem?: ReactElement;
  borderless?: boolean,
  deselectable?: boolean,
  maxWidth?: number
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
  function ListNext({
                       borderless,
                       children,
                       className,
                       disabled,
                       deselectable,
                       ListItem = DefaultListItem,
                       maxWidth,
                       emptyMessage,
                       multiselect,
                       onSelect,
                       onFocus,
                       ...rest
                     }, ref) {
    const emptyList = Children.count(children) === 0;
    const {selectedIndex, focusedIndex, listRef, handleClick} = useList({
      items: children,
      onSelect,
      onFocus,
      deselectable,
    });
    const forkedRef = useForkRef(ref, listRef);

    function renderEmpty() {
      return <ListItemNext className={withBaseName("empty-message")}
                           role="presentation">
        {emptyMessage || defaultEmptyMessage}
      </ListItemNext>
    }

    function renderContent() {
      return Children.map(children, (listItem, index) => {
        const childProps = {
          showCheckbox: multiselect,
          onClick: (e) => handleClick(e, index),
          selected: selectedIndex === index,
          tabIndex: focusedIndex === index,
          ...listItem.props
        }
        return isValidElement(listItem) &&
        cloneElement(listItem, {
          ...mergeProps(childProps, listItem.props),
        })
      })
    }

    return (
      <ul ref={forkedRef} className={clsx(withBaseName(), {
        [withBaseName('borderless')]: borderless
      }, className)} role="listbox"
          tabIndex={disabled || !emptyList ? undefined : 0}
          aria-activedescendant={selectedIndex}
          {...rest}
      >
        {emptyList ? renderEmpty() : renderContent()}
      </ul>)
  });
