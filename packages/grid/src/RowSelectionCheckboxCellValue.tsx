import { CheckboxBase } from "@jpmorganchase/uitk-lab";
import { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import "./CheckboxCell.css";
import { MouseEventHandler } from "react";
import { useCursorContext } from "./CursorContext";

export function RowSelectionCheckboxCellValue<T>(props: GridCellValueProps<T>) {
  const { row, column, isFocused } = props;
  const { selRowIdxs, selectRows } = useSelectionContext();
  const { moveCursor } = useCursorContext();

  const isSelected = selRowIdxs.has(row.index);

  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    selectRows({ rowIndex: row.index, incremental: true });
    moveCursor("body", row.index, column.index);
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="uitkGridCheckboxContainer" onMouseDown={onMouseDown}>
      <CheckboxBase
        data-testid="grid-row-selection-checkbox"
        inputProps={{
          "aria-label": "Select Row",
          tabIndex: isFocused ? 0 : -1,
        }}
        checked={isSelected}
      />
    </div>
  );
}
