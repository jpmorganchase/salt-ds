import React, { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer, Text, Tooltip } from "@salt-ds/core";
import { Highlighter } from "./Highlighter";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import listItemNextCss from "./ListItemNext.css";

import { useOverflowDetection } from "../utils";

const withBaseName = makePrefixer("saltListItemNext");

export interface ListItemNextProps extends HTMLAttributes<HTMLLIElement> {
  itemTextHighlightPattern?: RegExp | string;
  label?: string;
  disabled?: boolean;
  focused?: boolean;
  selected?: boolean;
  showCheckbox?: boolean;
  id?: string;
  role?: string;
}

export const ListItemNext = forwardRef<HTMLLIElement, ListItemNextProps>(
  function ListItemNext(
    {
      children,
      className: classNameProp,
      disabled,
      focused,
      itemTextHighlightPattern,
      label,
      role = "option",
      selected,
      id,
      onClick,
      ...props
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-hightligher",
      css: listItemNextCss,
      window: targetWindow,
    });

    const className = clsx(
      withBaseName(),
      {
        [withBaseName("disabled")]: disabled,
        [withBaseName("focused")]: focused,
      },
      classNameProp
    );

    const [overflowRef, isOverflowed] = useOverflowDetection<HTMLDivElement>();

    const content = label || children;

    const renderListItem = () => (
      <li
        ref={ref}
        className={className}
        {...props}
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        role={role}
        id={id}
        onClick={onClick}
      >
        {/*// if the user sends something that is not a string, they would have to handle disabled and overflow */}
        {children && typeof children !== "string" ? (
          children
        ) : (
          <Text
            as="p"
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
      </li>
    );

    return isOverflowed ? (
      <Tooltip
        disabled={!isOverflowed}
        open={focused} // TODO: this needs to be on hover, not on focus!
        content={content}
        hideIcon
      >
        {renderListItem()}
      </Tooltip>
    ) : (
      renderListItem()
    );
  }
);
