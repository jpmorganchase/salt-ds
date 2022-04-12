import { memo, MouseEventHandler, useCallback } from "react";
import { CellValueProps } from "../../model";
import "./RowSelectionCheckboxColumn.css";
import { CheckboxCheckedIcon, CheckboxIcon } from "../../../checkbox";
import { getRowKey } from "../../features/getAttribute";
import { useGridContext } from "../../GridContext";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridRowSelectionCheckboxCellValue");

export const RowSelectionCheckboxCellValue = memo(
  function RowSelectionCheckboxCell<T>(props: CellValueProps<T, undefined>) {
    const { model } = useGridContext();
    const { row } = props;
    const isSelected = row.useIsSelected();

    const onMouseDown: MouseEventHandler = useCallback((event) => {
      const rowKey = getRowKey(event.target as HTMLElement);
      model.rowSelection.toggleRow(rowKey);
      event.preventDefault();
      event.stopPropagation();
    }, []);

    return (
      <div className={withBaseName()} onMouseDown={onMouseDown}>
        {isSelected ? (
          <CheckboxCheckedIcon className={withBaseName("checkedIcon")} />
        ) : (
          <CheckboxIcon className={withBaseName("uncheckedIcon")} />
        )}
      </div>
    );
  }
);
