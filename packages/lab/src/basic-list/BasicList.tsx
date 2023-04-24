import {makePrefixer} from "@salt-ds/core";
import {
  Children, cloneElement,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler, MouseEventHandler, ReactElement, ReactNode
} from "react";
import "./BasicList.css";
import {clsx} from "clsx";
import {BasicListItem} from "./BasicListItem";

const withBaseName = makePrefixer("saltList");
const defaultEmptyMessage = "No data to display";

export interface BasicListProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  emptyMessage?: string;
  multiselect?: boolean;
  ListItem?: ReactElement;

}
export interface ListControlProps {
  "aria-activedescendant"?: string;
  onBlur: FocusEventHandler;
  onFocus: FocusEventHandler;
  onKeyDown: KeyboardEventHandler;
  onMouseDownCapture: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
}

export const BasicList = forwardRef<HTMLDivElement, BasicListProps>(function BasicList({
                                                                                         children,
                                                                                         className,
                                                                                         disabled,
                                                                                         ListItem = BasicListItem,
                                                                                         emptyMessage,
                                                                                         multiselect,
                                                                                         ...rest
                                                                                       }, ref) {

  function renderEmpty() {
    return <li className={clsx(withBaseName("empty-message"), className)} role="presentation">
      {emptyMessage || defaultEmptyMessage}
    </li>
  }

  const renderContent = () => {
    // if (collectionHook.data.length) {
    //   return renderCollectionItems(collectionHook.data);
    // }
    const childProps = {
      multiselect: multiselect
    }
    return children;
    // return Children.map(children, (child) => {
    //   cloneElement(child, childProps)
    // })
  };
  // TODO: add labelledby to ul?
  return (
    <ul ref={ref} className={clsx(withBaseName(), className)} role="listbox"
        tabIndex={disabled ? undefined : 0}>
      {Children.count(children) !== 0 ? renderContent() : renderEmpty()}
    </ul>)
});
