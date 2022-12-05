import { AutoSizeHeaderCell, HeaderCellProps } from "./HeaderCell";
import { useSelectionContext } from "./SelectionContext";
import { KeyboardEventHandler, MouseEventHandler } from "react";
import { CheckboxBase } from "@jpmorganchase/uitk-core";
import "./CheckboxCell.css";

export function RowSelectionCheckboxHeaderCell<T>(props: HeaderCellProps<T>) {
  const { isFocused } = props;
  const { selectAll, unselectAll, isAllSelected, isAnySelected } =
    useSelectionContext();

  const handleMouseDown: MouseEventHandler<HTMLInputElement> = () => {
    if (isAllSelected) {
      unselectAll();
    } else {
      selectAll();
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === " ") {
      if (isAllSelected) {
        unselectAll();
      } else {
        selectAll();
      }
    }
  };

  return (
    <AutoSizeHeaderCell {...props}>
      <div className="uitkGridCheckboxHeaderCell" onMouseDown={handleMouseDown}>
        <CheckboxBase
          inputProps={{
            "aria-label": "Select all rows",
            tabIndex: isFocused ? 0 : -1,
          }}
          checked={isAllSelected}
          indeterminate={!isAllSelected && isAnySelected}
          onKeyDown={handleKeyDown}
        />
      </div>
    </AutoSizeHeaderCell>
  );
}
