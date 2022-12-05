import { KeyboardEvent, useEffect } from 'react';
import { RowSelectionCheckboxHeaderCell } from "./RowSelectionCheckboxHeaderCell";
import { RowSelectionCheckboxCell } from "./RowSelectionCheckboxCell";
import { GridColumn, GridColumnProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { useCursorContext } from './CursorContext';

export type RowSelectionCheckboxColumnProps<T> = Omit<
  GridColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionCheckboxColumn<T>(
  props: RowSelectionCheckboxColumnProps<T>
) {
  const { selectRows } = useSelectionContext();

  const onKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    rowIndex: number
  ) => {
    if (event.key === " ") {
      selectRows({ rowIndex, meta: true });
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <GridColumn
      {...props}
      defaultWidth={100}
      headerComponent={RowSelectionCheckboxHeaderCell}
      cellComponent={RowSelectionCheckboxCell}
      pinned="left"
      onKeyDown={onKeyDown}
    />
  );
}
