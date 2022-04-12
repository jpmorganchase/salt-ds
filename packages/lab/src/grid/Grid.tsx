import {
  CellSelectionMode,
  ColumnDefinition,
  ColumnGroupDefinition,
  GridModel,
  RowSelectionMode,
} from "./model";
import { useState } from "react";
import { GridContext } from "./GridContext";
import { GridBase } from "./components";

export interface GridCallbacks<T> {
  onVisibleRowRangeChanged?: (visibleRowRange: [number, number]) => void;
}

export type RowKeyGetter<T> = (row: T, index: number) => string;

export interface GridData<T> {
  getKey: RowKeyGetter<T>;
  columnDefinitions?: ColumnDefinition<T>[];
  columnGroupDefinitions?: ColumnGroupDefinition<T>[];
  showFooter?: boolean;
  showTree?: boolean;
  showCheckboxes?: boolean;
  rowSelectionMode?: RowSelectionMode;
  cellSelectionMode?: CellSelectionMode;
  data: T[];
}

export type GridProps<T> = GridCallbacks<T> & GridData<T>;

export function Grid<T>(props: GridProps<T>) {
  const [context] = useState(() => ({
    model: new GridModel<T>(props.getKey),
  }));

  const { model } = context;
  const { rowSelectionMode = "single", cellSelectionMode = "none" } = props;

  model.setColumnDefinitions(props.columnDefinitions);
  model.setColumnGroupDefinitions(props.columnGroupDefinitions);
  model.setShowFooter(props.showFooter);
  model.setShowTree(props.showTree);
  model.setShowCheckboxes(props.showCheckboxes);
  model.setData(props.data);
  model.setRowSelectionMode(rowSelectionMode);
  model.setCellSelectionMode(cellSelectionMode);
  model.setCallbacks(props.onVisibleRowRangeChanged);

  return (
    <GridContext.Provider value={context}>
      <GridBase />
    </GridContext.Provider>
  );
}
