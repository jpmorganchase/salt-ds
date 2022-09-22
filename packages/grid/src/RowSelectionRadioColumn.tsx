import { RowSelectionRadioCellValue } from "./RowSelectionRadioCellValue";
import { GridColumn, GridColumnProps } from "./GridColumn";
import { RowSelectionRadioHeaderCell } from "./RowSelectionRadioHeaderCell";

export type RowSelectionRadioColumnProps<T> = Omit<
  GridColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionRadioColumn<T>(
  props: RowSelectionRadioColumnProps<T>
) {
  return (
    <GridColumn
      {...props}
      defaultWidth={100}
      headerComponent={RowSelectionRadioHeaderCell}
      cellValueComponent={RowSelectionRadioCellValue}
      pinned="left"
    />
  );
}
