import {
  Children,
  cloneElement,
  isValidElement,
  MouseEventHandler,
} from "react";
import "./TableRow.css";
import { BaseCell } from "../BaseCell";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import { GridColumnModel, GridRowModel } from "../Grid";
import { FakeCell } from "./FakeCell";
import { DefaultCellValue } from "./DefaultCellValue";
import { useGridContext } from "../GridContext";

const withBaseName = makePrefixer("uitkGridTableRow");

export interface TableRowProps<T> {
  row: GridRowModel<T>;
  isSelected?: boolean;
  isHoverOver?: boolean;
  zebra?: boolean;
  columns: GridColumnModel<T>[];
  cursorColKey?: string;
  onMouseEnter?: MouseEventHandler<HTMLTableRowElement>;
  onMouseLeave?: MouseEventHandler<HTMLTableRowElement>;
  gap?: number;
  editorColKey?: string;
  isCellSelected?: (rowIdx: number, colIdx: number) => boolean;
}

export function TableRow<T>(props: TableRowProps<T>) {
  const {
    row,
    isSelected,
    zebra,
    isHoverOver,
    columns,
    onMouseEnter,
    onMouseLeave,
    cursorColKey,
    gap,
    editorColKey,
    isCellSelected,
  } = props;

  const grid = useGridContext();

  if (!row.key) {
    throw new Error(`Invalid row`);
  }

  return (
    <tr
      className={cn(withBaseName(), {
        [withBaseName("zebra")]: zebra,
        [withBaseName("hover")]: isHoverOver,
        [withBaseName("selected")]: isSelected,
      })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-row-index={row.index}
      data-row-key={row.key}
      role="row"
    >
      {columns.map((column, i) => {
        const colKey = column.info.props.id;
        if (editorColKey === colKey) {
          const editorInfo = grid.getEditor(column.info.props.id);
          if (editorInfo) {
            if (isValidElement(editorInfo.children)) {
              const editorElement = Children.only(editorInfo.children);
              return cloneElement(editorElement, {
                row,
                column,
              } as any);
            }
          }
        }

        const Cell = column.info.props.cellComponent || BaseCell;
        const CellValue =
          column.info.props.cellValueComponent || DefaultCellValue;
        const value = column.info.props.getValue
          ? column.info.props.getValue(row.data)
          : null;
        const isFocused = cursorColKey === colKey;
        const isSelected =
          isCellSelected && isCellSelected(row.index, column.index);

        return (
          <Cell
            key={colKey}
            row={row}
            column={column}
            isFocused={isFocused}
            isSelected={isSelected}
          >
            <CellValue column={column} row={row} value={value} />
          </Cell>
        );
      })}
      {gap !== undefined && gap > 0 ? <FakeCell row={row} /> : null}
    </tr>
  );
}
