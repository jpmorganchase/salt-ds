import { RowSelectionCheckboxHeaderCell } from "./RowSelectionCheckboxHeaderCell";
import { RowSelectionCheckboxCellValue } from "./RowSelectionCheckboxCellValue";
import { GridColumn, GridColumnProps } from "./GridColumn";

export type RowSelectionColumnProps<T> = Omit<
  GridColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionColumn<T>(props: RowSelectionColumnProps<T>) {
  return (
    <GridColumn
      {...props}
      defaultWidth={100}
      headerComponent={RowSelectionCheckboxHeaderCell}
      cellValueComponent={RowSelectionCheckboxCellValue}
      pinned="left"
    />
  );
}
