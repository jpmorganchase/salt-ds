import { CheckboxIcon, makePrefixer } from "@jpmorganchase/uitk-core";
import { GridCellValueProps } from "./GridColumn";
import { useSelectionContext } from "./SelectionContext";
import { MouseEventHandler } from "react";
import "./CheckboxCell.css";

export function RowSelectionCheckboxCellValue<T>(props: GridCellValueProps<T>) {
  const { row } = props;
  const { selRowKeys, selectRows } = useSelectionContext();

  const isSelected = selRowKeys.has(row.key);
  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    selectRows(row.index, false, true);
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="uitkGridCheckboxContainer" onMouseDown={onMouseDown}>
      <CheckboxIcon checked={isSelected} />
    </div>
  );
}
