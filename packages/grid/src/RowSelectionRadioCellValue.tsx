import { RadioButtonIcon } from "@jpmorganchase/uitk-core";
import { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { MouseEventHandler } from "react";
import "./CheckboxCell.css";

export function RowSelectionRadioCellValue<T>(props: GridCellValueProps<T>) {
  const { row } = props;
  const { selRowIdxs, selectRows } = useSelectionContext();

  const isSelected = selRowIdxs.has(row.index);
  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    selectRows(row.index, false, false);
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className="uitkGridCheckboxContainer"
      onMouseDown={onMouseDown}
      data-testid="grid-row-selection-radiobox"
    >
      <RadioButtonIcon checked={isSelected} />
    </div>
  );
}
