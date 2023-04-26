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
  ReactElement
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

    const emptyList = (source && !source.length) || Children.count(children) === 0;

    function renderEmpty() {
      return <BasicListItem className={withBaseName("empty-message")}
                 role="presentation">
        {emptyMessage || defaultEmptyMessage}
      </BasicListItem>
    }

    function renderContent() {
      // if (collectionHook.data.length) {
      //   return renderCollectionItems(collectionHook.data);
      // }
      const childProps = {
        // showCheckbox: multiselect
      }
      //check if it is source, wrap and pass props else
      // (children are assumed to be BasicListItem or custom component)
      return Children.map(children, (child) => {
        const isChildItem = isValidElement(child);

        return cloneElement(child, childProps)
      });
    };

    // TODO: add labelledby to ul?
    return (
      <ul ref={ref} className={clsx(withBaseName(), {
        [withBaseName('borderless')]: borderless
      },className)} role="listbox"
          tabIndex={disabled ? undefined : 0} {...rest}>
        {emptyList ? renderEmpty() : renderContent()}
      </ul>)
  });
