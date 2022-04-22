import { useCallback, useEffect, useMemo } from "react";
import { Story } from "@storybook/react";
// @ts-ignore
import { RemoteDataSource, Servers, useViewserver } from "@vuu-ui/data-remote";

import { Blotter, BlotterRecord, makeFakeBlotterRecord } from "./grid/blotter";
import {
  ColumnDefinition,
  ColumnGroupDefinition,
  createNumericColumn,
  createTextColumn,
  DataGrid,
  DataSetColumnDefinition,
  Grid,
} from "@brandname/lab";

export default {
  title: "Lab/Grid/Vuu Data",
  component: Grid,
};

const vuuTableMeta = {
  instruments: {
    columns: [
      "bbg",
      "currency",
      "description",
      "exchange",
      "isin",
      "lotSize",
      "ric",
    ],
    dataTypes: [
      "string",
      "string",
      "string",
      "string",
      "string",
      "int",
      "string",
    ],
    key: "ric",
  },
};

const getKey = (record: BlotterRecord | undefined, index: number) =>
  record ? record.key : String(index);

export const DefaultGridWithVuuData = () => {
  const { columns, dataTypes } = vuuTableMeta.instruments;
  const [dataConfig, dataSource] = useMemo(() => {
    const dataConfig = {
      bufferSize: 100,
      columns,
      serverName: Servers.Vuu,
      tableName: { table: "instruments", module: "SIMUL" },
      serverUrl: "127.0.0.1:8090/websocket",
    };
    return [dataConfig, new RemoteDataSource(dataConfig)];
  }, []);

  const datasourceMessageHandler = useCallback(
    (message) => {
      const { type, ...msg } = message;
      console.log(`message from viewport ${type}`);
    },
    [dataSource]
  );

  useEffect(() => {
    dataSource.subscribe(
      {
        range: { lo: 0, hi: 30 },
      },
      datasourceMessageHandler
    );
  }, [dataSource, datasourceMessageHandler]);

  return (
    <Grid
      data={[]}
      // columnDefinitions={columnDefinitions}
      rowSelectionMode={"single"}
      showCheckboxes={true}
      getKey={getKey}
      isZebra={true}
    />
  );
};
