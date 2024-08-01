import { type KeyboardEvent, useCallback } from "react";
import { GridColumn, type GridColumnProps } from "./GridColumn";
import { RowSelectionRadioCellValue } from "./RowSelectionRadioCellValue";
import { RowSelectionRadioHeaderCell } from "./RowSelectionRadioHeaderCell";
import { useSelectionContext } from "./SelectionContext";

export type RowSelectionRadioColumnProps<T> = Omit<
  GridColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionRadioColumn<T>(
  props: RowSelectionRadioColumnProps<T>,
) {
  const { selectRows } = useSelectionContext();

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, rowIndex: number) => {
      if (event.key === " ") {
        selectRows({ rowIndex });
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [selectRows],
  );

  return (
    <GridColumn
      {...props}
      defaultWidth={100}
      headerComponent={RowSelectionRadioHeaderCell}
      cellValueComponent={RowSelectionRadioCellValue}
      onKeyDown={onKeyDown}
    />
  );
}
