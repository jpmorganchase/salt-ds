import {
  Children,
  cloneElement,
  isValidElement,
  MouseEventHandler,
} from "react";
import "./TableRow.css";
import { BaseCell } from "../BaseCell";
import { makePrefixer } from "@salt-ds/core";
import cn from "classnames";
import { GridColumnModel, GridRowModel } from "../Grid";
import { FakeCell } from "./FakeCell";
import { DefaultCellValue } from "./DefaultCellValue";
import { useGridContext } from "../GridContext";

const withBaseName = makePrefixer("uitkGridTableRow");

export interface TableRowProps<T> {
  row: GridRowModel<T>;
  isSelected?: boolean; // Render selected background and the bottom border. Top border is rendered by the previous row (it gets isFollowedBySelected = true)
  isFollowedBySelected?: boolean; // Next row is selected. Render the bottom border.
  isHoverOver?: boolean;
  zebra?: boolean;
  columns: GridColumnModel<T>[];
  cursorColIdx?: number;
  onMouseEnter?: MouseEventHandler<HTMLTableRowElement>;
  onMouseLeave?: MouseEventHandler<HTMLTableRowElement>;
  gap?: number;
  editorColIdx?: number;
  isCellSelected?: (rowIdx: number, colIdx: number) => boolean;
  headerIsFocusable?: boolean;
}

export function TableRow<T>(props: TableRowProps<T>) {
  const {
    row,
    isSelected,
    isFollowedBySelected,
    zebra,
    isHoverOver,
    columns,
    onMouseEnter,
    onMouseLeave,
    cursorColIdx,
    gap,
    editorColIdx,
    isCellSelected,
    headerIsFocusable,
  } = props;

  const grid = useGridContext();

  if (!row.key) {
    throw new Error(`Invalid row`);
  }

  const ariaRowIndex = headerIsFocusable ? row.index + 2 : row.index + 1;

  return (
    <tr
      aria-rowindex={ariaRowIndex}
      className={cn(withBaseName(), {
        [withBaseName("zebra")]: zebra,
        [withBaseName("hover")]: isHoverOver,
        [withBaseName("selected")]: isSelected,
        [withBaseName("followedBySelected")]:
          isFollowedBySelected && !isSelected,
        [withBaseName("first")]: row.index === 0,
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
            <CellValue
              column={column}
              row={row}
              value={value}
              isFocused={isFocused}
            />
          </Cell>
        );
      })}
      {gap !== undefined && gap > 0 ? <FakeCell row={row} /> : null}
    </tr>
  );
}
