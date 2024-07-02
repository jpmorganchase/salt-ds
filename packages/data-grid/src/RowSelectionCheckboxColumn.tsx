import { type KeyboardEvent, useCallback } from "react";
import { GridColumn, type GridColumnProps } from "./GridColumn";
import { AutoSizeHeaderCell } from "./HeaderCell";
import { RowSelectionCheckboxCellValue } from "./RowSelectionCheckboxCellValue";
import { RowSelectionCheckboxHeaderCellValue } from "./RowSelectionCheckboxHeaderCellValue";
import { useSelectionContext } from "./SelectionContext";

export type RowSelectionCheckboxColumnProps<T> = Omit<
  GridColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionCheckboxColumn<T>(
  props: RowSelectionCheckboxColumnProps<T>,
) {
  const { selectRows } = useSelectionContext();

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, rowIndex: number) => {
      if (event.key === " ") {
        selectRows({
          rowIndex,
          incremental: true,
        });
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
      headerComponent={AutoSizeHeaderCell}
      headerValueComponent={RowSelectionCheckboxHeaderCellValue}
      cellValueComponent={RowSelectionCheckboxCellValue}
      onKeyDown={onKeyDown}
    />
  );
}
