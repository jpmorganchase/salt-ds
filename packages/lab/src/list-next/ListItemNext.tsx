import { forwardRef, HTMLAttributes, MouseEvent } from "react";
import { clsx } from "clsx";
import { makePrefixer, useId } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import listItemNextCss from "./ListItemNext.css";
import { useListItems } from "./ListNextContext";

const withBaseName = makePrefixer("saltListItemNext");

export interface ListItemNextProps extends HTMLAttributes<HTMLLIElement> {
  label?: string;
  /**
   * If true, the particular list item in list will be disabled.
   */
  disabled?: boolean;
  selected?: boolean;
  id?: string;
  value: string;
}

export const ListItemNext = forwardRef<HTMLLIElement, ListItemNextProps>(
  function ListItemNext(
    {
      children,
      className,
      disabled: disabledProp,
      selected: selectedProp,
      label,
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
    const id = useId(idProp) || value;

    const listContext = useListItems();
    if (!listContext) return null;

    const {
      id: contextId,
      disabled: contextDisabled,
      select,
      isSelected,
      isFocused,
    } = listContext;

    const itemId = `${contextId || "listNext"}--${id}`;
    const content = label || children;
    const disabled = disabledProp || contextDisabled;
    const selected = selectedProp || isSelected(value);
    const focused = isFocused(itemId);

    const handleClick = (event: MouseEvent<HTMLLIElement>) => {
      select(event);
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
        {content}
      </li>
    );
  }
);
