import "./HeaderCell.css";
import { Column, ColumnSeparatorType } from "../model";
import { ReactNode } from "react";
import { useColumnResize } from "../features/useColumnResize";
import { useColumnMove } from "../features/useColumnMove";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridHeaderCell");

export interface HeaderCellProps<T> {
  column: Column<T>;
  children: ReactNode;
}

export interface HeaderCellSeparatorProps {
  separatorType: ColumnSeparatorType;
}

export function HeaderCellSeparator(props: HeaderCellSeparatorProps) {
  const className = withBaseName(
    props.separatorType === "regular" ? "regularSeparator" : "edgeSeparator"
  );
  return <div className={className} />;
}

// Column header cell
export function HeaderCell<T>(props: HeaderCellProps<T>) {
  const { column, children } = props;
  const separator = column.useSeparator();

  const onResizeHandleMouseDown = useColumnResize();
  const onMoveHandleMouseDown = useColumnMove();

  return (
    <th
      data-column-index={column.index}
      className={withBaseName()}
      role="columnheader"
    >
      <div className={withBaseName("valueContainer")}>{children}</div>
      <HeaderCellSeparator separatorType={separator} />
      <div
        className={withBaseName("resizeHandle")}
        onMouseDown={onResizeHandleMouseDown}
      />
      <div
        className={withBaseName("moveHandle")}
        onMouseDown={onMoveHandleMouseDown}
      />
    </th>
  );
}
