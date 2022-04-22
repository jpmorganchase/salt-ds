// @ts-ignore
import { RemoteDataSource, Servers, useViewserver } from "@vuu-ui/data-remote";
import { useMemo, useCallback, useState } from "react";
import { ColumnDefinition, Grid } from "../../../src";

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

const { columns, dataTypes } = vuuTableMeta.instruments;

// TODO How to get a unique key for a row?
function getKey(row: any, index: number) {
  return "unique_key";
}

// TODO define columns
const columnDefinitions: ColumnDefinition[] = [];

export const VuuGridExample = () => {
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

  const onRpcResponse = useCallback((response) => {
    console.log(`handleRpcResponse ${JSON.stringify(response)}`);
  }, []);

  const {
    buildViewserverMenuOptions,
    dispatchGridAction,
    handleMenuAction,
    makeRpcCall,
  } = useViewserver({
    dataSource,
    onRpcResponse,
  });

  // TODO how to get data from dataSource?
  const [data, setData] = useState<any[]>([]);

  const onVisibleRangeChanged = (range: [number, number]) => {
    const [start, end] = range;
    // TODO how to inform Vuu that it needs to provide rows [start, end]?
  };

  return (
    <Grid
      getKey={getKey}
      columnDefinitions={columnDefinitions}
      data={data}
      onVisibleRowRangeChanged={onVisibleRangeChanged}
    />
  );
};
