import { makePrefixer, useIdMemo } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type MouseEvent } from "react";
import listItemNextCss from "./ListItemNext.css";
import { useListItem } from "./ListNextContext";

const withBaseName = makePrefixer("saltListItemNext");

export interface ListItemNextProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * If true, the particular list item in list will be disabled.
   */
  disabled?: boolean;
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
      id: idProp,
      value,
      onClick,
      ...props
    },
    ref,
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
      highlight,
      isHighlighted,
    } = listContext;

    const itemId = `${contextId || "listNext"}--${id}`;
    const disabled = disabledProp || contextDisabled;
    const selected = isSelected(value);
    const focused = isFocused(value);
    const highlighted = isHighlighted(value);

    const handleClick = (event: MouseEvent<HTMLLIElement>) => {
      if (!disabled) {
        select(event);
        onClick?.(event);
      }
    };

    const handleMouseMove = (event: MouseEvent<HTMLLIElement>) => {
      if (!highlighted) {
        highlight(event);
      }
    };

    return (
      <li
        ref={ref}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("highlighted")]: highlighted,
            [withBaseName("focused")]: focused,
          },
          className,
        )}
        role="option"
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        id={itemId}
        data-value={value}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {children}
      </li>
    );
  },
);
