import { Column, useObservable } from "../model";
import { useMemo } from "react";

export interface TableColGroupProps<T> {
  columns: Column<T>[];
}

export interface TableColProps<T> {
  column: Column<T>;
}

// Renders <colgroup> with <col>s to size grid columns
export function TableColGroup<T>(props: TableColGroupProps<T>) {
  const { columns } = props;
  return (
    <colgroup>
      {columns.map((column) => {
        return <TableCol key={column.key} column={column} />;
      })}
    </colgroup>
  );
}

export function TableCol<T>(props: TableColProps<T>) {
  const colWidth = props.column.useWidth();
  const style = useMemo(() => {
    return {
      width: `${colWidth}px`,
    };
  }, [colWidth]);
  return <col style={style} />;
}
