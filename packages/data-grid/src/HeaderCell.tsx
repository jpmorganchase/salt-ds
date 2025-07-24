import {
  type FlexContentAlignment,
  makePrefixer,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type KeyboardEventHandler, useRef } from "react";

import { useColumnDragContext } from "./ColumnDragContext";
import { useColumnSortContext } from "./ColumnSortContext";
import { type ColumnSeparatorType, SortOrder } from "./Grid";
import type { HeaderCellProps } from "./GridColumn";
import headerCellCss from "./HeaderCell.css";
import { Cursor, useFocusableContent } from "./internal";
import { useSizingContext } from "./SizingContext";

const withBaseName = makePrefixer("saltGridHeaderCell");

export interface HeaderCellSeparatorProps {
  separatorType: ColumnSeparatorType;
}

export function HeaderCellSeparator(props: HeaderCellSeparatorProps) {
  const className = withBaseName([props.separatorType, "Separator"].join(""));
  return <div className={className} />;
}

interface HeaderCellSortingIconProps {
  justify: FlexContentAlignment;
  sortOrder: SortOrder;
}

const HeaderCellSortingIcon = ({
  justify,
  sortOrder,
}: HeaderCellSortingIconProps) => {
  const className = withBaseName("sortingIcon");
  return (
    <div
      className={clsx(className, {
        [withBaseName("sortingIconStart")]: justify === "start",
        [withBaseName("sortingIconEnd")]: justify === "end",
      })}
      aria-hidden
    >
      {sortOrder === SortOrder.ASC && <ArrowUpIcon />}
      {sortOrder === SortOrder.DESC && <ArrowDownIcon />}
    </div>
  );
};

type AriaSortProps = "none" | "ascending" | "descending";

export function HeaderCell<T>(props: HeaderCellProps<T>) {
  const { column, children, isFocused } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-header-cell",
    css: headerCellCss,
    window: targetWindow,
  });

  const { separator } = column;
  const { align, id, headerClassName, sortable, onSortOrderChange } =
    column.info.props;
  const { onResizeHandleMouseDown } = useSizingContext();

  const { columnMove, onColumnMoveHandleMouseDown } = useColumnDragContext();
  const onMouseDown = columnMove ? onColumnMoveHandleMouseDown : undefined;

  const { ref, isFocusableContent, onFocus } =
    useFocusableContent<HTMLTableHeaderCellElement>();

  const {
    onClickSortColumn,
    setSortByColumnId,
    sortOrder,
    sortByColumnId,
    setSortOrder,
  } = useColumnSortContext();

  const valueAlignRight = align === "right";

  const ariaSortMap = {
    asc: "ascending",
    desc: "descending",
    none: "none",
  };

  const ariaSort = ariaSortMap[sortOrder] as AriaSortProps;

  const order =
    sortOrder === SortOrder.ASC
      ? SortOrder.DESC
      : sortOrder === SortOrder.DESC
        ? SortOrder.NONE
        : SortOrder.ASC;

  const withSortOrder = sortOrder !== SortOrder.NONE && sortByColumnId === id;

  const onClick = () => {
    if (onSortOrderChange) {
      setSortByColumnId(id);
      setSortOrder(order);
      onSortOrderChange({ sortOrder: order });
      return;
    }
    setSortByColumnId(id);
    onClickSortColumn(id);
  };

  const onKeyDown: KeyboardEventHandler<HTMLTableHeaderCellElement> = (
    event,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      onClick();
    }
  };

  return (
    <th
      ref={ref}
      aria-colindex={column.index + 1}
      data-column-index={column.index}
      className={clsx(withBaseName(), headerClassName, {
        [withBaseName("sortable")]: sortable,
      })}
      role="columnheader"
      data-testid="column-header"
      tabIndex={isFocused && !isFocusableContent ? 0 : -1}
      onFocus={onFocus}
      onClick={sortable ? onClick : undefined}
      onKeyDown={sortable ? onKeyDown : undefined}
      aria-sort={sortByColumnId === id && sortable ? ariaSort : undefined}
      aria-label={column.info.props["aria-label"]}
    >
      {sortByColumnId === id && sortable && valueAlignRight && (
        <HeaderCellSortingIcon justify="start" sortOrder={sortOrder} />
      )}
      <div
        className={clsx(withBaseName("valueContainer"), {
          [withBaseName("alignRight")]: valueAlignRight,
          // both classNames below needed to ensure header cell title & sort icon do not overlap when column resized to be smaller
          [withBaseName("alignRightWithSortOrder")]:
            valueAlignRight && withSortOrder,
          [withBaseName("alignLeftWithSortOrder")]:
            !valueAlignRight && withSortOrder,
        })}
        onMouseDown={onMouseDown}
      >
        {children}
      </div>
      {sortByColumnId === id && sortable && !valueAlignRight && (
        <HeaderCellSortingIcon justify="end" sortOrder={sortOrder} />
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
    if (width !== undefined && width !== column.info.width) {
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
