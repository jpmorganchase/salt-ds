import type { DateStringDataTypeDefinition } from "ag-grid-community/dist/types/core/entities/dataType";
import type { dataGridExampleDataCellEditors } from "./cellEditorsData";

// https://www.ag-grid.com/javascript-data-grid/cell-data-types/#date-as-string-data-type-definition
export const dateString: DateStringDataTypeDefinition<
  (typeof dataGridExampleDataCellEditors)[number]
> = {
  baseDataType: "dateString",
  extendsDataType: "dateString",
  valueParser: (params) =>
    params.newValue?.match("\\d{4}-\\d{2}-\\d{2}") ? params.newValue : null,
  valueFormatter: (params) => (params.value == null ? "" : params.value),
  dataTypeMatcher: (value) =>
    typeof value === "string" && !!value.match("\\d{4}-\\d{2}-\\d{2}"),
  dateParser: (value) => {
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
  dateFormatter: (value) => {
    if (value == null) {
      return undefined;
    }
    const date = String(value.getDate());
    const month = String(value.getMonth() + 1);
    return `${value.getFullYear()}-${month.length === 1 ? `0${month}` : month}-${date.length === 1 ? `0${date}` : date}`;
  },
};
