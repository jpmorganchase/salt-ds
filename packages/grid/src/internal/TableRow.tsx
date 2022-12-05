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
import { GridColumnGroupModel, GridColumnModel, GridRowModel } from "../Grid";
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
  groups?: GridColumnGroupModel[];
  cursorColIdx?: number;
  onMouseEnter?: MouseEventHandler<HTMLTableRowElement>;
  onMouseLeave?: MouseEventHandler<HTMLTableRowElement>;
  gap?: number;
  editorColIdx?: number;
  isCellSelected?: (rowIdx: number, colIdx: number) => boolean;
}

export function TableRow<T>(props: TableRowProps<T>) {
  const {
    row,
    isSelected,
    zebra,
    isHoverOver,
    columns,
    groups,
    onMouseEnter,
    onMouseLeave,
    cursorColIdx,
    gap,
    editorColIdx,
    isCellSelected,
  } = props;

  const grid = useGridContext();

  if (!row.key) {
    throw new Error(`Invalid row`);
  }

  let startIndex = columns.length > 0 ? 1 : 0;
  startIndex += groups && groups.length > 0 ? 1 : 0;

  return (
    <tr
      // aria-rowindex uses one-based array indexing
      aria-rowindex={startIndex + row.index + 1}
      aria-selected={isSelected}
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
        const editorInfo = grid.getEditor(column.info.props.id);
        const isEditable = !!editorInfo;

        if (editorColIdx === column.index) {
          if (isEditable) {
            if (isValidElement(editorInfo.children)) {
              const editorElement = Children.only(editorInfo.children);
              return cloneElement(editorElement, {
                key: colKey,
                row,
                column,
              } as any);
            }
          }
        }

        const Cell = column.info.props.cellComponent || BaseCell;
        const CellValue =
          column.info.props.cellValueComponent || DefaultCellValue;
        const value =
          column.info.props.getValue && row.data
            ? column.info.props.getValue(row.data)
            : null;
        const isFocused = cursorColIdx === column.index;
        const isSelected =
          isCellSelected && isCellSelected(row.index, column.index);

        return (
          <Cell
            key={colKey}
            row={row}
            column={column}
            isFocused={isFocused}
            isSelected={isSelected}
            isEditable={isEditable}
          >
            <CellValue column={column} row={row} value={value} />
          </Cell>
        );
      })}
      {gap !== undefined && gap > 0 ? <FakeCell row={row} /> : null}
    </tr>
  );
}
