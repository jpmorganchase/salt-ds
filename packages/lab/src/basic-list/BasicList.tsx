import {makePrefixer} from "@salt-ds/core";
import {
  Children,
  cloneElement,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement, useRef, useState
} from "react";
import "./BasicList.css";
import {clsx} from "clsx";
import {BasicListItem, BasicListItem as DefaultListItem} from "./BasicListItem";
// import {useList} from "./useList";

const withBaseName = makePrefixer("saltList");
const defaultEmptyMessage = "No data to display";

export interface BasicListProps extends HTMLAttributes<HTMLUListElement> {
  disabled?: boolean;
  emptyMessage?: string;
  multiselect?: boolean;
  ListItem?: ReactElement;
  source?: ReadonlyArray<string>;
  borderless?: boolean,
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
                       ListItem = DefaultListItem,
                       maxWidth,
                       emptyMessage,
                       multiselect,
                       source,
                       ...rest
                     }, ref) {
    // const { } = useList({});

    const emptyList = (source && !source.length) || !source && Children.count(children) === 0; // this could look nicer
    const [lastItemFocusedIndex, setLastItemFocusedIndex] = useState(0);
    const listControlProps = {
      onFocus: () => {
        // if there is content => send it to the first, else focus on the list
        console.log('focus')}
    }
    function renderEmpty() {
      return <BasicListItem className={withBaseName("empty-message")}
                            role="presentation">
        {emptyMessage || defaultEmptyMessage}
      </BasicListItem>
    }

    function renderContent() {

      const childProps = {
        showCheckbox: multiselect
      }

      return source && source.length ? source.map((listItem, index) => {
        //add keys
        // we need to pass tabindex, if item is 0 or last focused then 0 otherwise -1
        const itemTabIndex = lastItemFocusedIndex === index ? 0 : -1
        return <BasicListItem tabIndex={itemTabIndex} { ...childProps}>{listItem}</BasicListItem>
      }) : Children.map(children, (child) => isValidElement(child) && cloneElement(child, childProps));
    }

    // TODO: add labelledby to ul?

    const isListFocusable = disabled || !emptyList;
    return (
      <ul ref={ref} className={clsx(withBaseName(), {
        [withBaseName('borderless')]: borderless
      }, className)} role="listbox"
          tabIndex={isListFocusable ? undefined : 0} {...rest} {...listControlProps}>
        {emptyList ? renderEmpty() : renderContent()}
      </ul>)
  });
