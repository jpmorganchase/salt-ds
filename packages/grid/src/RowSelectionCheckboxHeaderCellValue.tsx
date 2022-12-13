import { useSelectionContext } from "./SelectionContext";
import { KeyboardEventHandler, MouseEventHandler } from "react";
import { CheckboxBase } from "@jpmorganchase/uitk-lab";
import "./CheckboxCell.css";
import { GridHeaderValueProps } from "./GridColumn";

export function RowSelectionCheckboxHeaderCellValue<T>(
  props: GridHeaderValueProps<T>
) {
  const { isFocused } = props;

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
      className="uitkGridCheckboxContainer"
      onKeyDown={onKeyDown}
    >
      <CheckboxBase
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
