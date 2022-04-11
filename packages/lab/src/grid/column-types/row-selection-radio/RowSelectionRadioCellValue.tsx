import { makePrefixer } from "@brandname/core";
import { CellValueProps } from "../../model";
import { useGridContext } from "../../GridContext";
import { MouseEventHandler, useCallback } from "react";
import { getRowKey } from "../../features/getAttribute";
import { RadioIcon } from "../../../radio-button";

const withBaseName = makePrefixer("uitkGridRowSelectionRadioCellValue");

export const RowSelectionRadioCellValue = function RowSelecitonRadioCellValue<
  T
>(props: CellValueProps<T, undefined>) {
  const { model } = useGridContext();
  const { row } = props;
  const isSelected = row.useIsSelected();

  const onMouseDown: MouseEventHandler = useCallback((event) => {
    const rowKey = getRowKey(event.target as HTMLElement);
    model.rowSelection.selectRows({ rowKeys: [rowKey], isSelected: true });
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <div className={withBaseName()} onMouseDown={onMouseDown}>
      <RadioIcon checked={isSelected} />
    </div>
  );
};
