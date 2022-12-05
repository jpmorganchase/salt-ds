import { CheckboxBase } from "@jpmorganchase/uitk-core";
import { GridCellProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { ChangeEventHandler } from "react";
import "./CheckboxCell.css";
import { BaseCell } from "./BaseCell";

export function RowSelectionCheckboxCell<T>(props: GridCellProps<T>) {
  const { row, column, isFocused } = props;
  const { selRowIdxs, selectRows } = useSelectionContext();

  const isSelected = selRowIdxs.has(row.index);
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    selectRows({ rowIndex: row.index, meta: true });
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <BaseCell className="uitkGridCheckboxCell" row={row} column={column}>
      <CheckboxBase
        data-testid="grid-row-selection-checkbox"
        inputProps={{
          'aria-label': 'Select Row',
          tabIndex: isFocused ? 0 : -1,
        }}
        checked={isSelected}
        onChange={handleChange}
      />
    </BaseCell>
  );
}
