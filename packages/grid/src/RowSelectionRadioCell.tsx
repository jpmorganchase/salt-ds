import { RadioButtonBase } from "@jpmorganchase/uitk-core";
import { GridCellProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { MouseEventHandler } from "react";
import "./CheckboxCell.css";
import { BaseCell } from "./BaseCell";

export function RowSelectionRadioCell<T>(props: GridCellProps<T>) {
  const { column, row, isFocused } = props;
  const { selRowIdxs, selectRows } = useSelectionContext();

  const isSelected = selRowIdxs.has(row.index);
  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    selectRows({ rowIndex: row.index });
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <BaseCell row={row} column={column}>
      <div className="uitkGridCheckboxCell" onMouseDown={handleMouseDown}>
        <RadioButtonBase
          data-testid="grid-row-selection-radiobox"
          tabIndex={isFocused ? 0 : -1}
          checked={isSelected}
        />
      </div>
    </BaseCell>
  );
}
