import { KeyboardEvent } from "react";
import { RowSelectionCheckboxHeaderCell } from "./RowSelectionCheckboxHeaderCell";
import { RowSelectionCheckboxCellValue } from "./RowSelectionCheckboxCellValue";
import { GridColumn, GridColumnProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";

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
      cellValueComponent={RowSelectionCheckboxCellValue}
      pinned="left"
      onKeyDown={onKeyDown}
    />
  );
}
