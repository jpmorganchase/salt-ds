import { RadioButton } from "@salt-ds/lab";
import { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import "./CheckboxCell.css";

export function RowSelectionRadioCellValue<T>(props: GridCellValueProps<T>) {
  const { row, isFocused } = props;
  const { selRowIdxs } = useSelectionContext();

  const isSelected = selRowIdxs.has(row.index);

  return (
    <div className="saltGridCheckboxContainer">
      <RadioButton
        checked={isSelected}
        data-testid="grid-row-selection-radiobox"
        tabIndex={isFocused ? 0 : -1}
      />
    </div>
  );
}
