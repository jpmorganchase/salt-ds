import { DataSetColumnDefinition } from "./model";
import { DataGridModel } from "./model";
import { useMemo, useState } from "react";
import { KeyOfType } from "../grid";
import { GridContext } from "../grid/GridContext";
import { GridBase } from "../grid/components";
import { DataGridContext } from "./DataGridContext";
import "./DataGrid.css";

export interface DataGridProps<T> {
  getKey: (x: T) => string;
  childrenPropName: KeyOfType<T, T[] | undefined>;
  columnDefinitions: DataSetColumnDefinition<T>[];
  data: T[];
}

export const DataGrid = function TreeGrid<T>(props: DataGridProps<T>) {
  const [model] = useState<DataGridModel>(
    () => new DataGridModel(props.getKey, props.childrenPropName)
  );

  const dataGridContext = useMemo(
    () => ({ dataSet: model.dataSet }),
    [model.dataSet]
  );

  const gridContext = useMemo(
    () => ({ model: model.gridModel }),
    [model.gridModel]
  );

  model.setColumnDefinitions(props.columnDefinitions);
  model.setData(props.data);

  return (
    <DataGridContext.Provider value={dataGridContext}>
      <GridContext.Provider value={gridContext}>
        <GridBase />
      </GridContext.Provider>
    </DataGridContext.Provider>
  );
};
