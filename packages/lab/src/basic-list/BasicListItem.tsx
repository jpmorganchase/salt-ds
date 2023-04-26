import React, { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { Checkbox, makePrefixer, Text, Tooltip } from "@salt-ds/core";
import { Highlighter } from "./Highlighter";
import "./BasicListItem.css";
import { SuccessTickIcon } from "@salt-ds/icons";
import { useOverflowDetection } from "../utils";

const withBaseName = makePrefixer("saltBasicListItem");

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  itemTextHighlightPattern?: RegExp | string;
  label?: string;
  disabled?: boolean;
  selected?: boolean;
  showCheckbox?: boolean;
  role?: string;
}

export const BasicListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function BasicListItem(
    {
      children,
      className: classNameProp,
      disabled,
      // TODO: add header prop, turn role into non clickable, presentation and styles
      itemTextHighlightPattern,
      label,
      role = "option",
      selected,
      showCheckbox,
      ...props
    },
    ref
  ) {
    const className = clsx(
      withBaseName(),
      {
        [withBaseName("disabled")]: disabled,
        [withBaseName("checkbox")]: showCheckbox, // TODO: remove class once has is supported (june 2023ish)
      },
      classNameProp
    );

    const [overflowRef, isOverflowed] = useOverflowDetection<HTMLDivElement>();

    const content = label || children;

    return (
      <Tooltip disabled={!isOverflowed} content={content} hideIcon>
        <li
          ref={ref}
          className={className}
          {...props}
          aria-disabled={disabled || undefined}
          aria-selected={selected || undefined}
          role={role}
        >
          {showCheckbox && (
            <Checkbox aria-hidden checked={selected} disabled={disabled} />
          )}
          {children && typeof children !== "string" ? (
            children
          ) : (
            <Text
              className={withBaseName("textWrapper")}
              disabled={disabled}
              ref={overflowRef}
            >
              {itemTextHighlightPattern === null ? (
                content
              ) : (
                <Highlighter
                  matchPattern={itemTextHighlightPattern}
                  text={label || (children as string)}
                />
              )}
            </Text>
          )}
          {!showCheckbox && selected && <SuccessTickIcon />}
        </li>
      </Tooltip>
    );
  }
);
