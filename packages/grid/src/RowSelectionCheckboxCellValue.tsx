import { CheckboxIcon, makePrefixer } from "@jpmorganchase/uitk-core";
import { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { MouseEventHandler } from "react";
import "./CheckboxCell.css";

export function RowSelectionCheckboxCellValue<T>(props: GridCellValueProps<T>) {
  const { row } = props;
  const { selRowIdxs, selectRows } = useSelectionContext();

  const isSelected = selRowIdxs.has(row.index);
  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    selectRows({ rowIndex: row.index, meta: true });
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className="uitkGridCheckboxContainer"
      data-testid="grid-row-selection-checkbox"
      onMouseDown={onMouseDown}
    >
      <CheckboxIcon checked={isSelected} />
    </div>
  );
}
