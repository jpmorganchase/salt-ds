import { Checkbox } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { MouseEventHandler } from "react";
import { useCursorContext } from "./CursorContext";

import checkboxCellCss from "./CheckboxCell.css";

export function RowSelectionCheckboxCellValue<T>(props: GridCellValueProps<T>) {
  const { row, column, isFocused } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-checkbox-cell",
    css: checkboxCellCss,
    window: targetWindow,
  });

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
    <div className="saltGridCheckboxContainer" onMouseDown={onMouseDown}>
      <Checkbox
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
