import { RowSelectionRadioCell } from "./RowSelectionRadioCell";
import { GridColumn, GridColumnProps } from "./GridColumn";
import { RowSelectionRadioHeaderCell } from "./RowSelectionRadioHeaderCell";
import { useSelectionContext } from "./SelectionContext";
import { KeyboardEvent } from "react";

export type RowSelectionRadioColumnProps<T> = Omit<
  GridColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionRadioColumn<T>(
  props: RowSelectionRadioColumnProps<T>
) {
  const { selectRows } = useSelectionContext();

  const onKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    rowIndex: number
  ) => {
    if (event.key === " ") {
      selectRows({ rowIndex });
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <GridColumn
      {...props}
      defaultWidth={100}
      headerComponent={RowSelectionRadioHeaderCell}
      cellComponent={RowSelectionRadioCell}
      pinned="left"
      onKeyDown={onKeyDown}
    />
  );
}
