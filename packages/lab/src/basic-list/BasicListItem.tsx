import React, {forwardRef, HTMLAttributes} from "react";
import {clsx} from "clsx";
import {Checkbox, makePrefixer, Text} from "@salt-ds/core";
import {Highlighter} from "./Highlighter";
import "./BasicListItem.css";
import {SuccessTickIcon} from "@salt-ds/icons";

const withBaseName = makePrefixer("saltBasicListItem");

export interface ListItemProps<T = unknown>
  extends HTMLAttributes<HTMLDivElement> {
  itemTextHighlightPattern?: RegExp | string;
  label?: string;
  disabled?: boolean,
  selected?: boolean,
  showCheckbox?: boolean,
  role?: string
}


export const BasicListItem = forwardRef<HTMLDivElement, ListItemProps>(
  function ListItem(
    {
      children,
      className: classNameProp,
      disabled,
      itemTextHighlightPattern,
      label,
      role = 'option',
      selected,
      showCheckbox,
      ...props
    },
    forwardedRef
  ) {
    const className = clsx(withBaseName(), {
      [withBaseName("disabled")]: disabled,
      [withBaseName("checkbox")]: showCheckbox, // TODO: remove class once has is supported (june 2023ish)
    }, classNameProp);

    return (
      <li
        className={className}
        {...props}
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        role={role}
        ref={forwardedRef}
      >
        {/*{prefix}*/}
        {showCheckbox && <Checkbox aria-hidden checked={selected} disabled={disabled}/>}
        {children && typeof children !== "string" ? (
          children
        ) : itemTextHighlightPattern == null ? (
          <Text className={withBaseName("textWrapper")} disabled={disabled}>
            {label || children}
          </Text>
        ) : (
          <Highlighter
            matchPattern={itemTextHighlightPattern}
            text={label || (children as string)}
          />
        )}
        {(!showCheckbox && selected) && <SuccessTickIcon/>}
      </li>
    );
  }
);
