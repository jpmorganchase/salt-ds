import { KeyboardEventHandler, MouseEventHandler } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Checkbox } from "@salt-ds/core";

import { useSelectionContext } from "./SelectionContext";
import { GridHeaderValueProps } from "./GridColumn";

import checkboxCellCss from "./CheckboxCell.css";

export function RowSelectionCheckboxHeaderCellValue<T>(
  props: GridHeaderValueProps<T>
) {
  const { isFocused } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-checkbox-cell",
    css: checkboxCellCss,
    window: targetWindow,
  });

  const { selectAll, unselectAll, isAllSelected, isAnySelected } =
    useSelectionContext();

  const onMousedown: MouseEventHandler<HTMLDivElement> = (event) => {
    if (isAllSelected) {
      unselectAll();
    } else {
      selectAll();
    }
  };

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === " ") {
      if (isAllSelected) {
        unselectAll();
      } else {
        selectAll();
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <div
      onMouseDown={onMousedown}
      className="saltGridCheckboxContainer"
      onKeyDown={onKeyDown}
    >
      <Checkbox
        data-testid="grid-row-select-all-checkbox"
        inputProps={{
          "aria-label": "Select All",
          tabIndex: isFocused ? 0 : -1,
        }}
        checked={isAllSelected}
        indeterminate={!isAllSelected && isAnySelected}
      />
    </div>
  );
}
