import cn from "classnames";
import "./BaseCell.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridCellProps } from "./GridColumn";
import { GridColumnModel } from "./Grid";

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

  return (
    <td
      id={getCellId(row.key, column)}
      data-row-index={row.index}
      data-column-index={column.index}
      data-testid={isFocused ? "grid-cell-focused" : undefined}
      // aria-colindex uses one-based array indexing
      aria-colindex={column.index + 1}
      // aria-rowindex uses one-based array indexing
      aria-rowindex={row.index + 1}
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
      tabIndex={isFocused ? 0 : -1}
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
