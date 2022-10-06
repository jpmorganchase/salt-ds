import "./HeaderCell.css";
import { MouseEventHandler, ReactNode, useLayoutEffect, useRef } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import { ColumnSeparatorType, GridColumnModel } from "./Grid";
import { useSizingContext } from "./SizingContext";
import { useColumnDragContext } from "./ColumnDragContext";

const withBaseName = makePrefixer("uitkGridHeaderCell");

export interface HeaderCellProps<T> {
  column: GridColumnModel<T>;
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

export function HeaderCell<T>(props: HeaderCellProps<T>) {
  const { column, children } = props;
  const { separator } = column;
  const { onResizeHandleMouseDown } = useSizingContext();

  const { columnMove, onColumnMoveHandleMouseDown } = useColumnDragContext();
  const onMouseDown = columnMove ? onColumnMoveHandleMouseDown : undefined;

  return (
    <th
      data-column-index={column.index}
      className={cn(withBaseName(), column.info.props.headerClassName)}
      role="columnheader"
      data-testid="column-header"
    >
      <div
        className={cn(withBaseName("valueContainer"), {
          [withBaseName("alignRight")]: column.info.props.align === "right",
        })}
        onMouseDown={onMouseDown}
      >
        {children}
      </div>
      <HeaderCellSeparator separatorType={separator} />
      <div
        data-testid={`column-${column.index}-resize-handle`}
        className={withBaseName("resizeHandle")}
        onMouseDown={onResizeHandleMouseDown}
      />
    </th>
  );
}

export function AutoSizeHeaderCell<T>(props: HeaderCellProps<T>) {
  const { column, children } = props;
  const { separator } = column;
  const valueContainerRef = useRef<HTMLDivElement>(null);
  const { resizeColumn, rowHeight } = useSizingContext();

  useLayoutEffect(() => {
    const width = valueContainerRef.current
      ? valueContainerRef.current.offsetWidth
      : undefined;
    if (width != undefined && width !== column.info.width) {
      resizeColumn(column.index, width);
    }
  }, [valueContainerRef.current, column.info.width, rowHeight]);

  return (
    <th
      data-column-index={column.index}
      className={withBaseName()}
      role="columnheader"
      data-testid="column-header"
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
