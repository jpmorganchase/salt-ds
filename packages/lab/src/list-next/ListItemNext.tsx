import { forwardRef, HTMLAttributes, MouseEvent } from "react";
import { clsx } from "clsx";
import { makePrefixer, useIdMemo } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import listItemNextCss from "./ListItemNext.css";
import { useListItem } from "./ListNextContext";

const withBaseName = makePrefixer("saltListItemNext");

export interface ListItemNextProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * If true, the particular list item in list will be disabled.
   */
  disabled?: boolean;
  /**
   * If true, the particular list item in list will be selected.
   */
  selected?: boolean;
  /**
   * List item id.
   */
  id?: string;
  /**
   * List item value.
   */
  value: string;
}

export const ListItemNext = forwardRef<HTMLLIElement, ListItemNextProps>(
  function ListItemNext(
    {
      children,
      className,
      disabled: disabledProp,
      selected: selectedProp,
      id: idProp,
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
    const id = useIdMemo(idProp);

    const listContext = useListItem();
    if (!listContext) return null;

    const {
      id: contextId,
      disabled: contextDisabled,
      select,
      isSelected,
      isFocused,
    } = listContext;

    const itemId = `${contextId || "listNext"}--${id}`;
    const disabled = disabledProp || contextDisabled;
    const selected = selectedProp || isSelected(value);
    const focused = isFocused(itemId);

    const handleClick = (event: MouseEvent<HTMLLIElement>) => {
      if (!disabled) {
        select(event);
      }
      onClick?.(event);
    };

    return (
      <li
        ref={ref}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("focused")]: focused,
          },
          className
        )}
        role="option"
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        id={itemId}
        data-value={value}
        onClick={handleClick}
        {...props}
      >
        {children}
      </li>
    );
  }
);
