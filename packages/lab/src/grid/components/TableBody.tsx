import { Column, Row } from "../model";
import { MouseEventHandler, useCallback } from "react";
import { TableRow } from "./TableRow";
import { useGridContext } from "../GridContext";
import { getCellPosition, getRowKey } from "../features/getAttribute";

export interface TableBodyProps<T> {
  columns: Column<T>[];
  rows: Row<T>[];
}

// A piece of the grid's body. Renders the given rows and columns only.
// Three instances of this thing are rendered, one for each part having rows
// (left, middle, right).
export function TableBody<T>(props: TableBodyProps<T>) {
  const { columns, rows } = props;
  const { model } = useGridContext();
  const rowSelectionMode = model.useRowSelectionMode();
  const cellSelectionMode = model.useCellSelectionMode();

  const onMouseEnter: MouseEventHandler<HTMLTableRowElement> = useCallback(
    (event) => {
      const tr = event.currentTarget as HTMLTableRowElement;
      const rowIndex = parseInt(tr.getAttribute("data-row-index")!, 10);
      model.setHoverOverRowIndex(rowIndex);
    },
    []
  );

  const onMouseLeave: MouseEventHandler<HTMLTableRowElement> = useCallback(
    (event) => {},
    []
  );

  const onMouseDown: MouseEventHandler = useCallback(
    (event) => {
      const cell = getCellPosition(event.target as HTMLElement);
      const rowKey = getRowKey(event.target as HTMLElement);
      if (rowSelectionMode !== "none") {
        model.rowSelection.selectRows({
          clearPreviouslySelected: true,
          rowKeys: [rowKey],
          isSelected: true,
        });
      }
      if (cellSelectionMode !== "none") {
        model.cellSelection.selectCells({
          cellKeys: [
            {
              rowKey,
              columnIndex: cell.columnIndex,
              rowIndex: cell.rowIndex,
            },
          ],
        });
      }
      model.moveCursor(cell);
    },
    [rowSelectionMode, cellSelectionMode]
  );

  const onDoubleClick: MouseEventHandler = useCallback((event) => {
    model.editMode.start();
  }, []);

  return (
    <tbody onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
      {rows.map((row) => {
        return (
          <TableRow
            key={row.key}
            row={row}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            columns={columns}
          />
        );
      })}
    </tbody>
  );
}
