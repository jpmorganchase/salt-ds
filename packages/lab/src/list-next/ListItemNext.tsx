import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import listItemNextCss from "./ListItemNext.css";

const withBaseName = makePrefixer("saltListItemNext");

export interface ListItemNextProps extends HTMLAttributes<HTMLLIElement> {
  itemTextHighlightPattern?: RegExp | string;
  label?: string;
  /**
   * If true, the particular list item in list will be disabled.
   */
  disabled?: boolean;
  focused?: boolean;
  selected?: boolean;
  id?: string;
  value: string;
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
      value,
      onClick,
      ...props
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-list-item-next",
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

    const content = label || (children as string);

    return (
      <li
        ref={ref}
        className={className}
        {...props}
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        role={role}
        id={id}
        value={value}
        onClick={onClick}
      >
        {content}
      </li>
    );
  }
);
