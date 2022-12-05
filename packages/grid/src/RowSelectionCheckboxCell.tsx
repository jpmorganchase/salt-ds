import { CheckboxBase } from "@jpmorganchase/uitk-core";
import { GridCellProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { MouseEventHandler } from "react";
import "./CheckboxCell.css";
import { BaseCell } from "./BaseCell";

export function RowSelectionCheckboxCell<T>(props: GridCellProps<T>) {
  const { row, column, isFocused } = props;
  const { selRowIdxs, selectRows } = useSelectionContext();

  const isSelected = selRowIdxs.has(row.index);
  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    selectRows({ rowIndex: row.index, meta: true });
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <BaseCell row={row} column={column}>
      <div className="uitkGridCheckboxCell" onMouseDown={handleMouseDown}>
        <CheckboxBase
          data-testid="grid-row-selection-checkbox"
          inputProps={{
            "aria-label": "Select Row",
            tabIndex: isFocused ? 0 : -1,
          }}
          checked={isSelected}
        />
      </div>
    </BaseCell>
  );
}
