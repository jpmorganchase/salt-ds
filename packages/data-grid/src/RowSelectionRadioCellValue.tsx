import { RadioButton } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import checkboxCellCss from "./CheckboxCell.css";
import type { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";

export function RowSelectionRadioCellValue<T>(props: GridCellValueProps<T>) {
  const { row, isFocused } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-checkbox-cell",
    css: checkboxCellCss,
    window: targetWindow,
  });

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
