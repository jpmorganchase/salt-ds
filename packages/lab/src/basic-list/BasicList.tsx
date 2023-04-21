import {makePrefixer} from "@salt-ds/core";
import {
  Children,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler, MouseEventHandler, ReactNode
} from "react";
import "./BasicList.css";
import {clsx} from "clsx";

const withBaseName = makePrefixer("saltList");
const defaultEmptyMessage = "No data to display";

export interface BasicListProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  emptyMessage?: string;
  multiselect?: boolean;
  listItem?: ReactNode;

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
                                                                                         listItem: BasicListItem,
                                                                                         emptyMessage,
                                                                                         ...rest
                                                                                       }, ref) {

  function renderEmpty() {
    return <li className={clsx(withBaseName("empty-message"), className)}>
      {emptyMessage || defaultEmptyMessage}
    </li>
  }

  const renderContent = () => {
    // if (collectionHook.data.length) {
    //   return renderCollectionItems(collectionHook.data);
    // }
    return children;
  };
  return (
    <ul ref={ref} className={clsx(withBaseName(), className)} role="listbox"
        tabIndex={disabled ? undefined : 0}>
      {Children.count(children) !== 0 ? renderContent() : renderEmpty()}
    </ul>)
});
