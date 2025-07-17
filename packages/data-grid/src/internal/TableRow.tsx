import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  cloneElement,
  isValidElement,
  type MouseEventHandler,
} from "react";

import { BaseCell } from "../BaseCell";
import type { GridColumnModel, GridRowModel } from "../Grid";
import type { CellValidationState } from "../GridColumn";
import { useGridContext } from "../GridContext";
import { RowValidationStatusContext } from "../RowValidationStatus";

import { DefaultCellValue } from "./DefaultCellValue";
import { FakeCell } from "./FakeCell";

import tableRowCss from "./TableRow.css";

const withBaseName = makePrefixer("saltGridTableRow");

export interface TableRowProps<T> {
  row: GridRowModel<T>;
  isSelected?: boolean;
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
  validationStatus?: CellValidationState;
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
    cursorColIdx,
    gap,
    editorColIdx,
    isCellSelected,
    headerIsFocusable,
    validationStatus: rowValidationStatus,
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-row",
    css: tableRowCss,
    window: targetWindow,
  });

  const grid = useGridContext();

  if (!row.key) {
    throw new Error("Invalid row");
  }

  const ariaRowIndex = headerIsFocusable ? row.index + 2 : row.index + 1;

  return (
    <tr
      aria-rowindex={ariaRowIndex}
      aria-selected={isSelected ? true : undefined}
      className={clsx(withBaseName(), {
        [withBaseName("zebra")]: zebra,
        [withBaseName("hover")]: isHoverOver,
        [withBaseName("selected")]: isSelected,
        [withBaseName("first")]: row.index === 0,
        [withBaseName(`validationStatus-${rowValidationStatus}`)]:
          rowValidationStatus,
      })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-row-index={row.index}
      data-row-key={row.key}
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
        const isSelected = isCellSelected?.(row.index, column.index);
        const validationFnArg = {
          row,
          column,
          isFocused,
          value,
        };
        const validationStatus =
          column.info.props.getValidationStatus?.(validationFnArg);
        const validationMessage =
          validationStatus &&
          column.info.props.getValidationMessage?.(validationFnArg);

        return (
          <RowValidationStatusContext.Provider
            key={colKey}
            value={{ status: rowValidationStatus }}
          >
            <Cell
              row={row}
              column={column}
              isFocused={isFocused}
              isSelected={isSelected}
              isEditable={isEditable}
              validationStatus={validationStatus}
              validationMessage={validationMessage}
              validationType={column.info.props.validationType}
              value={value}
              align={column.info.props.align}
            >
              <CellValue
                column={column}
                row={row}
                value={value}
                isFocused={isFocused}
                validationStatus={validationStatus}
                validationMessage={validationMessage}
                validationType={column.info.props.validationType}
              />
            </Cell>
          </RowValidationStatusContext.Provider>
        );
      })}
      {gap !== undefined && gap > 0 ? <FakeCell row={row} /> : null}
    </tr>
  );
}
