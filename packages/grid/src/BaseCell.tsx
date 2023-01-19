import { clsx } from "clsx";
import "./BaseCell.css";
import { makePrefixer } from "@salt-ds/core";
import { GridCellProps } from "./GridColumn";
import { GridColumnModel } from "./Grid";
import { Cell, Cursor, useFocusableContent } from "./internal";
import { CornerTag } from "./CornerTag";

const withBaseName = makePrefixer("saltGridBaseCell");

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

  const { ref, isFocusableContent, onFocus } =
    useFocusableContent<HTMLTableCellElement>();

  return (
    <Cell
      ref={ref}
      id={getCellId(row.key, column)}
      data-row-index={row.index}
      data-column-index={column.index}
      data-testid={isFocused ? "grid-cell-focused" : undefined}
      // aria-colindex uses one-based array indexing
      aria-colindex={column.index + 1}
      role="gridcell"
      separator={column.separator}
      isSelected={isSelected}
      isEditable={isEditable}
      className={className}
      style={style}
      tabIndex={isFocused && !isFocusableContent ? 0 : -1}
      onFocus={onFocus}
    >
      <div className={clsx(withBaseName("valueContainer"))}>{children}</div>
      {isFocused && isEditable && <CornerTag focusOnly={true} />}
      {isFocused && !isFocusableContent && <Cursor />}
    </Cell>
  );
}
