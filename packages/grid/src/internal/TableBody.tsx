import { MouseEventHandler, useCallback, useMemo } from "react";
import { TableRow } from "./TableRow";
import { GridColumnGroupModel, GridColumnModel, GridRowModel } from '../Grid';
import { getRowKeyAttribute } from "./utils";
import { useSelectionContext } from "../SelectionContext";
import { useEditorContext } from "../EditorContext";
import { useCursorContext } from "../CursorContext";

export interface TableBodyProps<T> {
  columns: GridColumnModel<T>[];
  groups?: GridColumnGroupModel[];
  rows: GridRowModel<T>[];
  hoverRowKey?: string;
  setHoverRowKey: (key: string | undefined) => void;
  gap?: number;
  zebra?: boolean;
}

export function TableBody<T>(props: TableBodyProps<T>) {
  const { columns, rows, groups, hoverRowKey, setHoverRowKey, gap, zebra } = props;
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
    [selectedCellRange]
  );

  const { cursorRowIdx, cursorColIdx } = useCursorContext();

  const { editMode, startEditMode } = useEditorContext();

  const onRowMouseEnter: MouseEventHandler<HTMLTableRowElement> = (event) => {
    const target = event.target as HTMLElement;
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
        const cursorIdx = cursorRowIdx === row.index ? cursorColIdx : undefined;
        const editorColIdx = editMode ? cursorIdx : undefined;
        return (
          <TableRow
            key={row.key}
            row={row}
            onMouseEnter={onRowMouseEnter}
            columns={columns}
            groups={groups}
            isHoverOver={row.key === hoverRowKey}
            isSelected={isSelected}
            cursorColIdx={cursorIdx}
            gap={gap}
            zebra={zebra && row.index % 2 == 0}
            editorColIdx={editorColIdx}
            isCellSelected={isCellInSelectedRange}
          />
        );
      })}
    </tbody>
  );
}
