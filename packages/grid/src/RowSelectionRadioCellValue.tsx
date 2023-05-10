import { RadioButton } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";

import CheckboxCellCss from "./CheckboxCell.css";

export function RowSelectionRadioCellValue<T>(props: GridCellValueProps<T>) {
  const { row, isFocused } = props;

  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-checkbox-cell",
    css: CheckboxCellCss,
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
