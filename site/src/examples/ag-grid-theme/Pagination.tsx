import { useDensity, useTheme } from "@salt-ds/core";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { HTMLAttributes, useMemo, useRef, useState } from "react";
import { defaultColumns, defaultData } from "./data";

const generateData = (states: typeof defaultData) =>
  states.reduce((result, row) => {
    const data = [];
    data.push(row);
    for (let i = 0; i < 20; i++) {
      data.push({ ...row, name: `${row.name} ${i}` });
    }
    return [...result, ...data];
  }, [] as typeof defaultData);

export const Pagination = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        columnDefs={defaultColumns}
        pagination
        paginationPageSize={100}
        rowData={generateData(defaultData)}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

// Helps to set className, rowHeight and headerHeight depending on the current density
function useAgGridHelpers(compact = false): {
  containerProps: HTMLAttributes<HTMLDivElement>;
  agGridProps: AgGridReactProps;
  isGridReady: boolean;
  api?: GridApi;
  /**
   * @deprecated — Use methods via the grid api instead.
   */
  columnApi?: ColumnApi;
  compact?: boolean;
} {
  const apiRef = useRef<{ api: GridApi; columnApi: ColumnApi }>();
  const [isGridReady, setGridReady] = useState(false);
  const density = useDensity();
  const { mode } = useTheme();

  const [rowHeight, listItemHeight] = useMemo(() => {
    switch (density) {
      case compact && "high":
        return [20, 20];
      case "high":
        return [24, 24];
      case "medium":
        return [36, 36];
      case "low":
        return [48, 48];
      case "touch":
        return [60, 60];
      default:
        return [20, 24];
    }
  }, [density, compact]);

  const className = `ag-theme-salt${
    compact && density === "high" ? `-compact` : ``
  }-${mode}`;

  const onGridReady = ({ api, columnApi }: GridReadyEvent) => {
    apiRef.current = { api, columnApi };
    api.sizeColumnsToFit();
    setGridReady(true);
  };

  return {
    containerProps: {
      className,
      style: { height: 500, width: "100%" },
    },
    agGridProps: {
      onGridReady,
      rowHeight,
      headerHeight: rowHeight,
      suppressMenuHide: true,
      defaultColDef: {
        filter: true,
        resizable: true,
        sortable: true,
        filterParams: {
          cellHeight: listItemHeight,
        },
      },
    },
    isGridReady,
    api: apiRef.current?.api,
    columnApi: apiRef.current?.columnApi,
  };
}
