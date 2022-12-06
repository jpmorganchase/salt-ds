import { CheckboxBase } from "@jpmorganchase/uitk-core";
import { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import "./CheckboxCell.css";

export function RowSelectionCheckboxCellValue<T>(props: GridCellValueProps<T>) {
  const { row, isFocused } = props;
  const { selRowIdxs } = useSelectionContext();

  const isSelected = selRowIdxs.has(row.index);

  return (
    <div className="uitkGridCheckboxContainer">
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
