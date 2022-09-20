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
  const { column, className, row, style, isFocused, isSelected, children } =
    props;
  const isEditable = column.info.props.editable;

  return (
    <td
      id={getCellId(row.key, column)}
      data-row-index={row.index}
      data-column-index={column.index}
      aria-colindex={column.index}
      role="gridcell"
      className={cn(withBaseName(), className)}
      style={style}
    >
      <div
        className={cn(withBaseName("valueContainer"), {
          [withBaseName("focused")]: isFocused,
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
