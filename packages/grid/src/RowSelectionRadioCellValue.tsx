import { RadioButtonBase } from "@salt-ds/lab";
import { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import "./CheckboxCell.css";

export function RowSelectionRadioCellValue<T>(props: GridCellValueProps<T>) {
  const { row, isFocused } = props;
  const { selRowIdxs } = useSelectionContext();

  const isSelected = selRowIdxs.has(row.index);

  return (
    <div className="saltGridCheckboxContainer">
      <RadioButtonBase
        checked={isSelected}
        tabIndex={isFocused ? 0 : -1}
        data-testid="grid-row-selection-radiobox"
      />
    </div>
  );
}
