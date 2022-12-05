import { AutoSizeHeaderCell, HeaderCellProps } from "./HeaderCell";
import { useSelectionContext } from "./SelectionContext";
import { ChangeEventHandler, useEffect } from "react";
import { CheckboxBase } from "@jpmorganchase/uitk-core";
import "./CheckboxCell.css";

export function RowSelectionCheckboxHeaderCell<T>(props: HeaderCellProps<T>) {
  const {
    column: { index },
    isFocused
  } = props;
  const { selectAll, unselectAll, isAllSelected, isAnySelected } =
    useSelectionContext();

  const handleChange: ChangeEventHandler<HTMLInputElement> = () => {
    if (isAllSelected) {
      unselectAll();
    } else {
      selectAll();
    }
  };

  useEffect(() => {
    if (index === 0) {
    }
  }, [index]);

  return (
    <AutoSizeHeaderCell {...props}>
      <div className="uitkGridCheckboxHeaderCell">
        <CheckboxBase
          inputProps={{
            "aria-label": "Select all rows",
            tabIndex: isFocused ? 0 : -1
          }}
          onChange={handleChange}
          checked={isAllSelected}
          indeterminate={!isAllSelected && isAnySelected}
        />
      </div>
    </AutoSizeHeaderCell>
  );
}
