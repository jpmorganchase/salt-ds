import { useEffect, useMemo, useState } from "react";
import {
  VuuColumnDefinition,
  VuuConfig,
  VuuDataSet,
  VuuRow,
} from "./model/VuuDataSet";
import { VuuGridModel } from "./model/VuuGridModel";
import { RowKeyGetter } from "../grid";
import { GridVuuContext } from "./GridVuuContext";
import { GridContext } from "../grid/GridContext";
import { GridBase } from "../grid/components";

export interface GridVuuProps {
  getKey: RowKeyGetter<VuuRow>;
  columnDefinitions: VuuColumnDefinition[];
  vuuConfig: VuuConfig;
}

export const GridVuu = function GridVuu(props: GridVuuProps) {
  const [model] = useState<VuuGridModel>(
    () =>
      new VuuGridModel(props.getKey, props.columnDefinitions, props.vuuConfig)
  );

  const vuuGridContext = useMemo(
    () => ({ dataSet: model.dataSet }),
    [model.dataSet]
  );

  const gridContext = useMemo(
    () => ({ model: model.gridModel }),
    [model.gridModel]
  );

  useEffect(() => {
    model.dataSet.subscribe();
  }, []);

  return (
    <GridVuuContext.Provider value={vuuGridContext}>
      <GridContext.Provider value={gridContext}>
        <GridBase />
      </GridContext.Provider>
    </GridVuuContext.Provider>
  );
};
