import { RadioButtonBase } from "@jpmorganchase/uitk-core";
import { GridCellProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { ChangeEventHandler } from "react";
import "./CheckboxCell.css";
import { BaseCell } from "./BaseCell";

export function RowSelectionRadioCell<T>(props: GridCellProps<T>) {
  const { column, row, isFocused } = props;
  const { selRowIdxs, selectRows } = useSelectionContext();

  const isSelected = selRowIdxs.has(row.index);
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    selectRows({ rowIndex: row.index });
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <BaseCell row={row} column={column} className="uitkGridCheckboxCell" >
      <RadioButtonBase
        data-testid="grid-row-selection-radiobox"
        tabIndex={isFocused ? 0 : -1}
        onChange={handleChange}
        checked={isSelected}
      />
    </BaseCell>
  );
}
