import { RowSelectionCheckboxHeaderCell } from "./RowSelectionCheckboxHeaderCell";
import { RowSelectionCheckboxCellValue } from "./RowSelectionCheckboxCellValue";
import { GridColumn, GridColumnProps } from "./GridColumn";

export type RowSelectionCheckboxColumnProps<T> = Omit<
  GridColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionCheckboxColumn<T>(
  props: RowSelectionCheckboxColumnProps<T>
) {
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
