import "./HeaderCell.css";
import { KeyboardEventHandler, useRef } from "react";
import {
  FlexContentAlignment,
  FlexLayout,
  makePrefixer,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { ColumnSeparatorType } from "./Grid";
import { useSizingContext } from "./SizingContext";
import { useColumnDragContext } from "./ColumnDragContext";
import { Cursor, useFocusableContent } from "./internal";
import { HeaderCellProps } from "./GridColumn";
import { useColumnSortContext } from "./ColumnSortContext";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";

const withBaseName = makePrefixer("saltGridHeaderCell");

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
  const { align, id, headerClassName, isSortable } = column.info.props;
  const { onResizeHandleMouseDown } = useSizingContext();

  const { columnMove, onColumnMoveHandleMouseDown } = useColumnDragContext();
  const onMouseDown = columnMove ? onColumnMoveHandleMouseDown : undefined;

  const { ref, isFocusableContent, onFocus } =
    useFocusableContent<HTMLTableHeaderCellElement>();

  const { onClickSortColumn, setSortByColumnId, sortOrder, sortByColumnId } =
    useColumnSortContext();

  const valueAlignRight = align === "right";

  interface HeaderCellSortingIconProps {
    justify: FlexContentAlignment;
  }

  const HeaderCellSortingIcon = ({ justify }: HeaderCellSortingIconProps) => {
    const className = withBaseName("sortable");
    const icon = (
      <FlexLayout className={className} justify={justify} aria-hidden>
        {sortOrder === "asc" && <ArrowUpIcon />}
        {sortOrder === "desc" && <ArrowDownIcon />}
      </FlexLayout>
    );

    return icon;
  };

  const ariaSort =
    sortOrder === "asc"
      ? "ascending"
      : sortOrder === "desc"
      ? "descending"
      : "none";

  const onKeyDown: KeyboardEventHandler<HTMLTableHeaderCellElement> = (
    event
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      setSortByColumnId(id);
      onClickSortColumn(id);
    }
  };

  const onClick = () => {
    setSortByColumnId(id);
    onClickSortColumn(id);
  };

  return (
    <th
      ref={ref}
      aria-colindex={column.index + 1}
      data-column-index={column.index}
      className={clsx(withBaseName(), headerClassName)}
      role="columnheader"
      data-testid="column-header"
      tabIndex={isFocused && !isFocusableContent ? 0 : -1}
      onFocus={onFocus}
      onClick={isSortable ? onClick : undefined}
      onKeyDown={isSortable ? onKeyDown : undefined}
      aria-label={isSortable ? "sort column" : undefined}
      aria-sort={sortByColumnId === id && isSortable ? ariaSort : undefined}
    >
      {sortByColumnId === id && isSortable && valueAlignRight && (
        <HeaderCellSortingIcon justify="start" />
      )}
      <div
        className={clsx(withBaseName("valueContainer"), {
          [withBaseName("alignRight")]: valueAlignRight,
        })}
        onMouseDown={onMouseDown}
      >
        {children}
      </div>
      {sortByColumnId === id && isSortable && !valueAlignRight && (
        <HeaderCellSortingIcon justify="end" />
      )}
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

  useIsomorphicLayoutEffect(() => {
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
