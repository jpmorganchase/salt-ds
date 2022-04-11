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

export interface GridProps<T> {
  getKey: (x: T) => string;
  columnDefinitions?: ColumnDefinition<T>[];
  columnGroupDefinitions?: ColumnGroupDefinition<T>[];
  showFooter?: boolean;
  showTree?: boolean;
  showCheckboxes?: boolean;
  rowSelectionMode?: RowSelectionMode;
  cellSelectionMode?: CellSelectionMode;
  data: T[];
}

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

  return (
    <GridContext.Provider value={context}>
      <GridBase />
    </GridContext.Provider>
  );
}
