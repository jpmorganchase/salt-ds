import { forwardRef, ForwardedRef, HTMLAttributes, memo } from "react";
import cx from "classnames";
import { CheckboxIcon, makePrefixer } from "@jpmorganchase/uitk-core";
import { ListItemType, ListItemProps } from "./listTypes";
import { Highlighter } from "./Highlighter";

import "./ListItem.css";

const withBaseName = makePrefixer("uitkListItem");

// A dummy ListItem rendered once and not visible. We measure this to
// determine height of ListItem and monitor it for size changes (in
// case of runtime density switch). This allows ListItem height to
// be controlled purely through CSS.
export const ListItemProxy = forwardRef(function ListItemNextProxy(
  props: HTMLAttributes<HTMLDivElement>,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      aria-hidden
      className={cx(withBaseName(), withBaseName("proxy"))}
      ref={forwardedRef}
    />
  );
});

// Note: the memo is effective if List label is passed as simple string
// If children are used, it is the responsibility of caller to memoise
// these if performance on highlight is perceived to be an issue.
export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  function ListItem(
    {
      children,
      className: classNameProp,
      disabled,
      tabIndex,
      item,
      itemHeight,
      itemTextHighlightPattern,
      label,
      selectable: _notUsed,
      selected,
      showCheckbox,
      style: styleProp,
      ...props
    },
    forwardedRef
  ) {
    const className = cx(withBaseName(), classNameProp, {
      uitkDisabled: disabled,
      [withBaseName("checkbox")]: showCheckbox,
    });
    const style =
      itemHeight !== undefined
        ? {
            ...styleProp,
            height: itemHeight,
          }
        : styleProp;

    return (
      <div
        className={className}
        {...props}
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        ref={forwardedRef}
        style={style}
      >
        {showCheckbox && <CheckboxIcon aria-hidden checked={selected} />}
        {children && typeof children !== "string" ? (
          children
        ) : itemTextHighlightPattern == null ? (
          <span className={withBaseName("textWrapper")}>
            {label || children}
          </span>
        ) : (
          <Highlighter
            matchPattern={itemTextHighlightPattern}
            text={label || (children as string)}
          />
        )}
      </div>
    );
  }
) as ListItemType;
