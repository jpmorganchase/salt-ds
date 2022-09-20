import { AutoSizeHeaderCell, HeaderCellProps } from "./HeaderCell";
import { useSelectionContext } from "./SelectionContext";
import { MouseEventHandler } from "react";
import { CheckboxIcon, makePrefixer } from "@jpmorganchase/uitk-core";
import "./CheckboxCell.css";

export function RowSelectionCheckboxHeaderCell<T>(props: HeaderCellProps<T>) {
  const { selectAll, unselectAll, isAllSelected, isAnySelected } =
    useSelectionContext();

  const onMousedown: MouseEventHandler<HTMLDivElement> = (event) => {
    if (isAllSelected) {
      unselectAll();
    } else {
      selectAll();
    }
  };

  return (
    <AutoSizeHeaderCell {...props}>
      <div onMouseDown={onMousedown} className="uitkGridCheckboxCell">
        <CheckboxIcon
          checked={isAllSelected}
          indeterminate={!isAllSelected && isAnySelected}
        />
      </div>
    </AutoSizeHeaderCell>
  );
}
