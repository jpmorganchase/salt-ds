import React, { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { Checkbox, makePrefixer, Text, Tooltip } from "@salt-ds/core";
import { Highlighter } from "./Highlighter";
import "./ListItemNext.css";
import { SuccessTickIcon } from "@salt-ds/icons";
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
      // TODO: add header prop, turn role into non clickable, presentation and styles
      itemTextHighlightPattern,
      label,
      role = "option",
      selected,
      showCheckbox,
      tabIndex,
      id,
      ...props
    },
    ref
  ) {
    const className = clsx(
      withBaseName(),
      {
        [withBaseName("disabled")]: disabled,
        [withBaseName("focused")]: focused,
        [withBaseName("checkbox")]: showCheckbox, // TODO: remove class once has is supported (june 2023ish)
      },
      classNameProp
    );
    const isFocusableContent = role === "option" || !disabled;

    const [overflowRef, isOverflowed] = useOverflowDetection<HTMLDivElement>();

    const content = label || children;

    const listItemControlProps = {
      onFocus: () => {
        // setIsFocused(true)
        isFocusableContent && console.log("focus");
      },
    };
    // const [isFocused, setIsFocused] = useState(false);
    return (
      <Tooltip disabled={!isOverflowed} content={content} hideIcon>
        <li
          ref={ref}
          className={className}
          {...props}
          aria-disabled={disabled || undefined}
          // aria-selected={selected || undefined}
          role={role}
          id={id}
          // tabIndex={tabIndex}
          {...listItemControlProps}
        >
          {showCheckbox && (
            <Checkbox aria-hidden checked={selected} disabled={disabled} />
          )}
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
      </Tooltip>
    );
  }
);
