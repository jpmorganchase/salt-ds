import cn from "classnames";
import "./BaseCell.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridCellProps } from "./GridColumn";
import { GridColumnModel } from "./Grid";
import { FocusEventHandler, useRef, useState } from "react";

const withBaseName = makePrefixer("uitkGridBaseCell");

export function getCellId<T>(rowKey: string, column: GridColumnModel<T>) {
  return `R${rowKey}C${column.info.props.id}`;
}

// Default component for grid cells. Provides selection, on-hover highlighting,
// cursor etc.
export function BaseCell<T>(props: GridCellProps<T>) {
  const {
    column,
    className,
    row,
    style,
    isFocused,
    isSelected,
    isEditable,
    children,
  } = props;

  const tdRef = useRef<HTMLTableCellElement>(null);
  const [isFocusableContent, setFocusableContent] = useState<boolean>(false);

  const onFocus: FocusEventHandler<HTMLTableCellElement> = (event) => {
    if (event.target === tdRef.current) {
      const nestedInteractive = tdRef.current.querySelector(`[tabindex="0"]`);
      if (nestedInteractive) {
        (nestedInteractive as HTMLElement).focus();
        setFocusableContent(true);
      }
    }
  };

  return (
    <td
      ref={tdRef}
      id={getCellId(row.key, column)}
      data-row-index={row.index}
      data-column-index={column.index}
      data-testid={isFocused ? "grid-cell-focused" : undefined}
      // aria-colindex uses one-based array indexing
      aria-colindex={column.index + 1}
      role="gridcell"
      className={cn(
        withBaseName(),
        {
          [withBaseName("regularSeparator")]:
            column.separator === "regular" || column.separator === "groupEdge",
          [withBaseName("pinnedSeparator")]: column.separator === "pinned",
        },
        className
      )}
      style={style}
      tabIndex={isFocused && !isFocusableContent ? 0 : -1}
      onFocus={onFocus}
    >
      <div
        className={cn(withBaseName("valueContainer"), {
          [withBaseName("editable")]: isEditable,
          [withBaseName("selected")]: isSelected,
        })}
      >
        {children}
      </div>
      {isFocused && isEditable && <div className={withBaseName("cornerTag")} />}
    </td>
  );
}
