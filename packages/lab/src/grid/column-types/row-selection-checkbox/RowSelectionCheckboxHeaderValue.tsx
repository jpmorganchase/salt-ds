import { memo, MouseEventHandler, useCallback } from "react";
import { HeaderValueProps } from "../../model";
import "./RowSelectionCheckboxColumn.css";
import { useGridContext } from "../../GridContext";
import { CheckboxCheckedIcon, CheckboxIcon } from "../../../checkbox";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridRowSelectionCheckboxHeaderValue");

export const RowSelectionCheckboxHeaderValue = memo(
  function RowSelectionCheckboxHeaderValue<T>(props: HeaderValueProps<T>) {
    const { model } = useGridContext();
    const isAllSelected = model.rowSelection.useIsAllSelected();

    const onMouseDown: MouseEventHandler = useCallback(
      (event) => {
        console.log(`Sending selectAll ${!isAllSelected}`);
        model.rowSelection.selectAll(!isAllSelected);
        event.preventDefault();
        event.stopPropagation();
      },
      [isAllSelected]
    );

    return (
      <div className={withBaseName()} onMouseDown={onMouseDown}>
        {isAllSelected ? (
          <CheckboxCheckedIcon className={withBaseName("checkedIcon")} />
        ) : (
          <CheckboxIcon className={withBaseName("uncheckedIcon")} />
        )}
      </div>
    );
  }
);
