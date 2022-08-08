import { Column, Row } from "../model";
import { HTMLAttributes, MouseEventHandler, useCallback } from "react";
import { TableRow } from "./TableRow";
import { useGridContext } from "../GridContext";
import { getCellPosition, getRowKey } from "../features/getAttribute";

export interface TableBodyProps<T> {
  columns: Column<T>[];
  rows: Row<T>[];
}

export function TableBody<T>(props: TableBodyProps<T>) {
  const { columns, rows } = props;
  const { model } = useGridContext();
  const rowSelectionMode = model.useRowSelectionMode();
  const cellSelectionMode = model.useCellSelectionMode();
  const backgroundVariant = model.useBackgroundVariant();
  const isRangeSelectionInProgress =
    model.cellSelection.useIsRangeSelectionInProgress();

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
      if (cellSelectionMode === "single") {
        model.cellSelection.selectCells({
          cellKeys: [
            {
              rowKey,
              columnIndex: cell.columnIndex,
              rowIndex: cell.rowIndex,
            },
          ],
        });
      } else if (cellSelectionMode === "multi") {
        model.cellSelection.selectionStart({
          cellKey: {
            rowKey,
            columnIndex: cell.columnIndex,
            rowIndex: cell.rowIndex,
          },
        });
        event.preventDefault();
      }
      model.moveCursor(cell);
    },
    [rowSelectionMode, cellSelectionMode]
  );

  const onMouseMove: MouseEventHandler = useCallback(
    (event) => {
      if (isRangeSelectionInProgress) {
        const cell = getCellPosition(event.target as HTMLElement);
        const rowKey = getRowKey(event.target as HTMLElement);
        model.cellSelection.selectionMove({
          cellKey: {
            rowKey,
            columnIndex: cell.columnIndex,
            rowIndex: cell.rowIndex,
          },
        });
      }
    },
    [rowSelectionMode, cellSelectionMode, isRangeSelectionInProgress]
  );

  const onMouseUp: MouseEventHandler = useCallback(
    (event) => {
      if (isRangeSelectionInProgress) {
        const cell = getCellPosition(event.target as HTMLElement);
        const rowKey = getRowKey(event.target as HTMLElement);
        model.cellSelection.selectionEnd({
          cellKey: {
            rowKey,
            columnIndex: cell.columnIndex,
            rowIndex: cell.rowIndex,
          },
        });
      }
    },
    [isRangeSelectionInProgress]
  );

  const onDoubleClick: MouseEventHandler = useCallback((event) => {
    model.editMode.start();
  }, []);

  const tbodyProps: HTMLAttributes<HTMLElement> = {
    onMouseDown,
    onDoubleClick,
  };

  if (isRangeSelectionInProgress) {
    tbodyProps.onMouseMove = onMouseMove;
    tbodyProps.onMouseUp = onMouseUp;
  }

  return (
    <tbody {...tbodyProps} onMouseDown={onMouseDown}>
      {rows.map((row) => {
        return (
          <TableRow
            key={row.key}
            row={row}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            columns={columns}
            backgroundVariant={backgroundVariant}
          />
        );
      })}
    </tbody>
  );
}
