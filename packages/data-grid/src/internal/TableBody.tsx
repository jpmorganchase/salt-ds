import { type MouseEventHandler, useCallback, useMemo } from "react";
import { useCursorContext } from "../CursorContext";
import { useEditorContext } from "../EditorContext";
import type { GridColumnModel, GridRowModel } from "../Grid";
import type { CellValidationState } from "../GridColumn";
import { useSelectionContext } from "../SelectionContext";
import { TableRow } from "./TableRow";
import { getRowKeyAttribute } from "./utils";

export interface TableBodyProps<T> {
  columns: GridColumnModel<T>[];
  rows: GridRowModel<T>[];
  hoverRowKey?: string;
  setHoverRowKey: (key: string | undefined) => void;
  gap?: number;
  zebra?: boolean;
  getRowValidationStatus?: (
    row: GridRowModel<T>,
  ) => CellValidationState | undefined;
}

export function TableBody<T>(props: TableBodyProps<T>) {
  const {
    columns,
    rows,
    hoverRowKey,
    setHoverRowKey,
    gap,
    zebra,
    getRowValidationStatus,
  } = props;
  const { selRowIdxs, selectedCellRange } = useSelectionContext();

  const isCellInSelectedRange = useCallback(
    (rowIdx: number, colIdx: number) => {
      if (!selectedCellRange) {
        return false;
      }
      const { start, end } = selectedCellRange;
      const minRowIdx = Math.min(start.rowIdx, end.rowIdx);
      const maxRowIdx = Math.max(start.rowIdx, end.rowIdx);
      const minColIdx = Math.min(start.colIdx, end.colIdx);
      const maxColIdx = Math.max(start.colIdx, end.colIdx);
      return (
        rowIdx >= minRowIdx &&
        rowIdx <= maxRowIdx &&
        colIdx >= minColIdx &&
        colIdx <= maxColIdx
      );
    },
    [selectedCellRange],
  );

  const { cursorRowIdx, cursorColIdx, focusedPart, headerIsFocusable } =
    useCursorContext();

  const { editMode, startEditMode } = useEditorContext();

  const onRowMouseEnter: MouseEventHandler<HTMLTableRowElement> = (event) => {
    const target = event.currentTarget as HTMLElement;
    const rowKey = getRowKeyAttribute(target);
    setHoverRowKey(rowKey);
  };

  const onMouseLeave: MouseEventHandler<HTMLTableSectionElement> = (event) => {
    setHoverRowKey(undefined);
  };

  const onDoubleClick: MouseEventHandler<HTMLTableSectionElement> = (event) => {
    startEditMode();
  };

  return (
    <tbody onMouseLeave={onMouseLeave} onDoubleClick={onDoubleClick}>
      {rows.map((row) => {
        const isSelected = selRowIdxs.has(row.index);
        const cursorIdx =
          focusedPart === "body" && cursorRowIdx === row.index
            ? cursorColIdx
            : undefined;
        const editorColIdx = editMode ? cursorIdx : undefined;
        return (
          <TableRow
            key={row.key}
            row={row}
            onMouseEnter={onRowMouseEnter}
            columns={columns}
            isHoverOver={row.key === hoverRowKey}
            isSelected={isSelected}
            cursorColIdx={cursorIdx}
            gap={gap}
            zebra={zebra && row.index % 2 == 0}
            editorColIdx={editorColIdx}
            isCellSelected={isCellInSelectedRange}
            headerIsFocusable={headerIsFocusable}
            validationStatus={
              getRowValidationStatus ? getRowValidationStatus(row) : undefined
            }
          />
        );
      })}
    </tbody>
  );
}
