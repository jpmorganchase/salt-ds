import { Column, ColumnDefinition, Row } from "../model";
import { memo, MouseEventHandler } from "react";
import "./TableRow.css";
import { BaseCell } from "./BaseCell";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridTableRow");

export interface TableRowProps<T = any> {
  row: Row<T>;
  columns: Column<T>[];
  onMouseEnter: MouseEventHandler<HTMLTableRowElement>;
  onMouseLeave: MouseEventHandler<HTMLTableRowElement>;
}

function getCellValue<T, U>(
  columnDefinition: ColumnDefinition<T, U>,
  rowData: T
) {
  const { field, cellValueGetter } = columnDefinition;
  if (cellValueGetter) {
    return cellValueGetter(rowData);
  }
  if (field) {
    return rowData[field] as any as U;
  }
}

export const TableRow = memo<TableRowProps>(function TableRow<T>(
  props: TableRowProps<T>
) {
  const { row, columns, onMouseEnter, onMouseLeave } = props;

  const data = row.useData();
  const isSelected = row.useIsSelected();
  const isHoverOver = row.useIsHoverOver();
  const isZebra = row.useIsZebra();
  const cursorColumnIndex = row.useCursorColumnIndex();
  const isEditMode = row.useIsEditMode();
  const index = row.useIndex();

  return (
    <tr
      className={withBaseName()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-row-index={index}
      data-row-key={row.key}
      role="row"
    >
      {columns.map((column) => {
        const definition = column.definition;
        const value = getCellValue(definition, data);
        const isFocused = cursorColumnIndex === column.index;

        if (isEditMode && isFocused && definition.editorComponent) {
          const Editor = definition.editorComponent;
          return <Editor />;
        }

        const Cell = definition.cellComponent;
        if (Cell) {
          return <Cell />;
        }

        const CellValue = definition.cellValueComponent;
        if (CellValue) {
          return (
            <BaseCell
              key={column.key}
              row={row}
              column={column}
              isHoverOverRow={isHoverOver}
              isSelectedRow={isSelected}
              isFocused={isFocused}
              isAlternate={isZebra}
            >
              <CellValue column={column} row={row} value={value} />
            </BaseCell>
          );
        }

        return <td>ERROR</td>;
      })}
    </tr>
  );
});
