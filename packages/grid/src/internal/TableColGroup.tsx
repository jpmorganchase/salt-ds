import { useMemo } from "react";
import { GridColumnModel } from "../Grid";

export interface TableColGroupProps<T> {
  columns: GridColumnModel<T>[];
  gap?: number;
}

export interface TableColProps<T> {
  width: number;
}

// Controls column widths.
export function TableColGroup<T>(props: TableColGroupProps<T>) {
  const { columns, gap } = props;
  return (
    <colgroup>
      {columns.map((column) => {
        return (
          <TableCol key={column.info.props.id} width={column.info.width} />
        );
      })}
      {gap !== undefined && gap > 0 ? (
        <TableCol key="__gap" width={gap} />
      ) : null}
    </colgroup>
  );
}

export function TableCol<T>(props: TableColProps<T>) {
  const { width } = props;
  const style = useMemo(() => {
    return {
      width: `${width}px`,
    };
  }, [width]);
  return <col style={style} />;
}
