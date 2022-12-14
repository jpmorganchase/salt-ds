import "./HeaderCell.css";
import { useLayoutEffect, useRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import cn from "classnames";
import { ColumnSeparatorType } from "./Grid";
import { useSizingContext } from "./SizingContext";
import { useColumnDragContext } from "./ColumnDragContext";
import { Cursor, useFocusableContent } from "./internal";
import { HeaderCellProps } from "./GridColumn";

const withBaseName = makePrefixer("uitkGridHeaderCell");

export interface HeaderCellSeparatorProps {
  separatorType: ColumnSeparatorType;
}

export function HeaderCellSeparator(props: HeaderCellSeparatorProps) {
  const className = withBaseName([props.separatorType, "Separator"].join(""));
  return <div className={className} />;
}

export function HeaderCell<T>(props: HeaderCellProps<T>) {
  const { column, children, isFocused } = props;
  const { separator } = column;
  const { onResizeHandleMouseDown } = useSizingContext();

  const { columnMove, onColumnMoveHandleMouseDown } = useColumnDragContext();
  const onMouseDown = columnMove ? onColumnMoveHandleMouseDown : undefined;

  const { ref, isFocusableContent, onFocus } =
    useFocusableContent<HTMLTableHeaderCellElement>();

  return (
    <th
      ref={ref}
      aria-colindex={column.index + 1}
      data-column-index={column.index}
      className={cn(withBaseName(), column.info.props.headerClassName)}
      role="columnheader"
      data-testid="column-header"
      tabIndex={isFocused && !isFocusableContent ? 0 : -1}
      onFocus={onFocus}
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
      {isFocused && !isFocusableContent && <Cursor />}
    </th>
  );
}

export function AutoSizeHeaderCell<T>(props: HeaderCellProps<T>) {
  const { column, children, isFocused } = props;
  const { separator } = column;
  const valueContainerRef = useRef<HTMLDivElement>(null);
  const { resizeColumn } = useSizingContext();

  const { ref, isFocusableContent, onFocus } =
    useFocusableContent<HTMLTableHeaderCellElement>();

  useLayoutEffect(() => {
    const width = valueContainerRef.current
      ? valueContainerRef.current.offsetWidth
      : undefined;
    if (width != undefined && width !== column.info.width) {
      resizeColumn(column.index, width);
    }
  });

  return (
    <th
      ref={ref}
      aria-colindex={column.index + 1}
      data-column-index={column.index}
      className={withBaseName()}
      role="columnheader"
      data-testid="column-header"
      tabIndex={isFocused && !isFocusableContent ? 0 : -1}
      onFocus={onFocus}
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
      {isFocused && !isFocusableContent && <Cursor />}
    </th>
  );
}
