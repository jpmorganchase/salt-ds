import { Column, Row } from "../model";
import { CSSProperties, FC, HTMLAttributes, memo } from "react";
import cn from "classnames";
import "./BaseCell.css";
import { Cursor } from "./Cursor";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridBaseCell");

export interface BaseCellProps<T = any>
  extends HTMLAttributes<HTMLTableDataCellElement> {
  row: Row<T>;
  column: Column<T>;
  isHoverOverRow?: boolean;
  isSelectedRow?: boolean;
  isFocused?: boolean;
  isAlternate?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function getCellId(row: Row, column: Column) {
  return `R${row.key}C${column.key}`;
}

// TODO this is a temporary thing for debugging
function shouldNotUpdate<T>(
  prev: BaseCellProps<T>,
  next: BaseCellProps<T>
): boolean {
  const props: (keyof BaseCellProps<T>)[] = [
    "row",
    "column",
    "isHoverOverRow",
    "isSelectedRow",
    "isFocused",
    "isAlternate",
    "className",
    "style",
  ];
  const idx = props.findIndex((p) => prev[p] !== next[p]);
  if (idx !== -1) {
    // console.log(`Prop ${props[idx]} changed`);
    return false;
  }
  return true;
}

// The standard wrapper for cell values.
// Takes care of the basic features such as zebra, hover over and selected row highlighting.
export const BaseCell: FC<BaseCellProps> = memo(function BaseCell(props) {
  const {
    row,
    column,
    isHoverOverRow,
    isSelectedRow,
    isFocused,
    isAlternate,
    className,
    style,
    children,
    ...restProps
  } = props;

  const index = row.useIndex();

  return (
    <td
      {...restProps}
      id={getCellId(row, column)}
      data-row-index={index}
      data-column-index={column.index}
      aria-colindex={column.index}
      role="gridcell"
      className={cn(
        withBaseName(),
        {
          [withBaseName("hover")]: isHoverOverRow,
          [withBaseName("selected")]: isSelectedRow,
          [withBaseName("zebra")]: isAlternate,
        },
        className
      )}
      style={style}
    >
      {isFocused ? <Cursor /> : null}
      <div className={withBaseName("valueContainer")}>{children}</div>
    </td>
  );
}, shouldNotUpdate);
