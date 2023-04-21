import React, {forwardRef, HTMLAttributes} from "react";
import {clsx} from "clsx";
import {Checkbox, makePrefixer, Text} from "@salt-ds/core";
import {Highlighter} from "./Highlighter";
import "./BasicListItem.css";

const withBaseName = makePrefixer("saltBasicListItem");

export interface ListItemProps<T = unknown>
  extends HTMLAttributes<HTMLDivElement> {
  itemTextHighlightPattern?: RegExp | string;
  label?: string;
  disabled: boolean,
  selected: boolean,
  showCheckbox: boolean,
  role: string
}


export const BasicListItem = forwardRef<HTMLDivElement, ListItemProps>(
  function ListItem(
    {
      children,
      disabled,
      selected,
      className: classNameProp,
      itemTextHighlightPattern,
      label,
      style: styleProp,
      role= 'option',
      showCheckbox,
      // itemRendered: BasicListItem
      ...props
    },
    forwardedRef
  ) {
    const className = clsx(withBaseName(), {
      [withBaseName("disabled")]: disabled,
    },classNameProp);
    const style = styleProp;
      // itemHeight !== undefined
      //   ? {
      //     ...styleProp,
      //     height: itemHeight,
      //   }
      //   : styleProp;

    return (
      <li
        className={className}
        {...props}
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        role={role}
        ref={forwardedRef}
        style={style}
      >
        {children && typeof children !== "string" ? (
          children
        ) : itemTextHighlightPattern == null ? (<>
            {showCheckbox && <Checkbox checked={selected}/> }
          <Text className={withBaseName("textWrapper")}>
            {label || children}
          </Text></>
        ) : (
          <Highlighter
            matchPattern={itemTextHighlightPattern}
            text={label || (children as string)}
          />
        )}
      </li>
    );
  }
);
