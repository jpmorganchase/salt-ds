// @ts-ignore
import { RemoteDataSource, Servers, useViewserver } from "@vuu-ui/data-remote";
import { useMemo, useCallback } from "react";

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
};
