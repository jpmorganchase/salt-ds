import { KeyboardEvent, useCallback } from "react";
import { RowSelectionCheckboxHeaderCellValue } from "./RowSelectionCheckboxHeaderCellValue";
import { RowSelectionCheckboxCellValue } from "./RowSelectionCheckboxCellValue";
import { GridColumn, GridColumnProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { AutoSizeHeaderCell } from "./HeaderCell";

export type RowSelectionCheckboxColumnProps<T> = Omit<
  GridColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionCheckboxColumn<T>(
  props: RowSelectionCheckboxColumnProps<T>
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
    [selectRows]
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
