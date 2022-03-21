import { ColumnDefinition, ColumnGroupDefinition, GridModel } from "./model";
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
  data: T[];
}

export function Grid<T>(props: GridProps<T>) {
  const [context] = useState(() => ({
    model: new GridModel<T>(props.getKey),
  }));

  const { model } = context;

  model.setColumnDefinitions(props.columnDefinitions);
  model.setColumnGroupDefinitions(props.columnGroupDefinitions);
  model.setShowFooter(props.showFooter);
  model.setShowTree(props.showTree);
  model.setShowCheckboxes(props.showCheckboxes);
  model.setData(props.data);

  return (
    <GridContext.Provider value={context}>
      <GridBase />
    </GridContext.Provider>
  );
}
