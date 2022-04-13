import "./HeaderCell.css";
import { Column, ColumnSeparatorType } from "../model";
import { Children, ReactNode, useEffect, useRef } from "react";
import { useColumnResize } from "../features/useColumnResize";
import { useColumnMove } from "../features/useColumnMove";
import { makePrefixer } from "@brandname/core";
import { useGridContext } from "../GridContext";

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

// Auto-sizing header cell
// Cannot be resized manually or moved
// Currently used for row selector column only
export function AutoSizingHeaderCell<T>(props: HeaderCellProps<T>) {
  const { column, children } = props;
  const valueContainerRef = useRef<HTMLDivElement>(null);

  const { model } = useGridContext();
  const separator = column.useSeparator();
  const rowHeight = model.useRowHeight();

  useEffect(() => {
    const width = valueContainerRef.current
      ? valueContainerRef.current.offsetWidth
      : undefined;
    if (width != undefined) {
      console.log(`AutoSizingHeaderCell measured width: ${width}px`);
      model.resizeColumn({
        columnIndex: column.index,
        width,
      });
    }
  }, [valueContainerRef.current, rowHeight]);

  return (
    <th
      data-column-index={column.index}
      className={withBaseName()}
      role="columnheader"
    >
      <div className={withBaseName("autosizeContainer")}>
        <div
          ref={valueContainerRef}
          className={withBaseName("measuredContent")}
        >
          {children}
        </div>
      </div>
      <HeaderCellSeparator separatorType={separator} />
    </th>
  );
}
