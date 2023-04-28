import {makePrefixer, useForkRef} from "@salt-ds/core";
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
import "./BasicList.css";
import {clsx} from "clsx";
import {BasicListItem, BasicListItem as DefaultListItem} from "./BasicListItem";
import {useList} from "./useList";

const withBaseName = makePrefixer("saltList");
const defaultEmptyMessage = "No data to display";

export interface BasicListProps extends HTMLAttributes<HTMLUListElement> {
  disabled?: boolean;
  emptyMessage?: string;
  multiselect?: boolean;
  ListItem?: ReactElement;
  source?: ReadonlyArray<string>;
  borderless?: boolean,
  deselectable?: boolean,
  maxWidth?: number
}

export interface ListControlProps {
  "aria-activedescendant"?: string;
  onBlur: FocusEventHandler;
  onFocus: FocusEventHandler;
  onKeyDown: KeyboardEventHandler;
  onMouseDownCapture: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
}

export const BasicList = forwardRef<HTMLUListElement, BasicListProps>(
  function BasicList({
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
                       source,
                       ...rest
                     }, ref) {
    const emptyList = (source && !source.length) || !source && Children.count(children) === 0;
    const listItems = source?.length ? source : children;

    // if source is items, we need to know what is selected, disabled...
    const {selectedIndex, focusedIndex, listRef, handleClick} = useList({
      items: listItems,
      onSelect,
      onFocus,
      deselectable,
    });
    const forkedRef = useForkRef(ref, listRef);

    function renderEmpty() {
      return <BasicListItem className={withBaseName("empty-message")}
                            role="presentation">
        {emptyMessage || defaultEmptyMessage}
      </BasicListItem>
    }

    function renderContent() {
      return Children.map(listItems, (listItem, index) => {
        // we need to pass tabindex, if item is 0 or last focused then 0 otherwise -1
        const childProps = {
          showCheckbox: multiselect,
          onClick: (e) => handleClick(e, index),
          selected: selectedIndex === index
        }
        // check isValidElement
        return source?.length ? <BasicListItem { ...childProps}>{listItem}</BasicListItem> : cloneElement(listItem, childProps)
      })
    }

    // TODO: add labelledby to ul?
    return (
      <ul ref={forkedRef} className={clsx(withBaseName(), {
        [withBaseName('borderless')]: borderless
      }, className)} role="listbox"
          tabIndex={disabled || !emptyList ? undefined : 0}
          {...rest}
      >
        {emptyList ? renderEmpty() : renderContent()}
      </ul>)
  });
