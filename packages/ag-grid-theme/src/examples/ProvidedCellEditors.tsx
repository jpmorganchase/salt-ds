import type {
  ValueFormatterLiteParams,
  ValueParserLiteParams,
} from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import agProvidedCellEditorsExampleColumns from "../dependencies/agProvidedCellEditorsExampleColumns";
import { dataGridExampleDataCellEditors } from "../dependencies/dataGridExampleDataCellEditors";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

// https://www.ag-grid.com/javascript-data-grid/cell-data-types/#date-as-string-data-type-definition
const dateString = {
  baseDataType: "dateString" as const,
  extendsDataType: "dateString" as const,
  valueParser: (
    params: ValueParserLiteParams<
      (typeof dataGridExampleDataCellEditors)[number],
      string
    >,
  ) =>
    params.newValue?.match("\\d{4}-\\d{2}-\\d{2}") ? params.newValue : null,
  valueFormatter: (
    params: ValueFormatterLiteParams<
      (typeof dataGridExampleDataCellEditors)[number],
      string
    >,
  ) => (params.value == null ? "" : params.value),
  dataTypeMatcher: (value: any) =>
    typeof value === "string" && !!value.match("\\d{4}-\\d{2}-\\d{2}"),
  dateParser: (value: string | undefined) => {
    if (value == null || value === "") {
      return undefined;
    }
    const dateParts = value.split("-");
    return dateParts.length === 3
      ? new Date(
          Number.parseInt(dateParts[0]),
          Number.parseInt(dateParts[1]) - 1,
          Number.parseInt(dateParts[2]),
        )
      : undefined;
  },
  dateFormatter: (value: Date | undefined) => {
    if (value == null) {
      return undefined;
    }
    const date = String(value.getDate());
    const month = String(value.getMonth() + 1);
    return `${value.getFullYear()}-${month.length === 1 ? `0${month}` : month}-${date.length === 1 ? `0${date}` : date}`;
  },
};

export const ProvidedCellEditors = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={agProvidedCellEditorsExampleColumns}
        rowData={[...dataGridExampleDataCellEditors]}
        dataTypeDefinitions={{ dateString }}
      />
    </div>
  );
};
