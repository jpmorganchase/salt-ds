import { HeaderValueProps } from "../../../grid";
import { useDataGridContext } from "../../DataGridContext";
import { MouseEventHandler } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@brandname/icons";

export const TextHeaderValue = function TextHeaderValue<T>(
  props: HeaderValueProps<T>
) {
  const { column } = props;
  const { dataSet } = useDataGridContext();

  // TODO move this to cell component
  const dataSetColumnsByKey = dataSet.useColumnsByKey();
  const dataSetColumn = dataSetColumnsByKey.get(column.key)!;
  const title = dataSetColumn.title;
  const sortDirection = dataSetColumn.useSortDirection();

  const onTitleClick: MouseEventHandler<HTMLSpanElement> = (event) => {
    dataSet.sort({ columnKey: column.key });
  };

  return (
    <span onClick={onTitleClick}>
      {title}
      {sortDirection === "ascending" ? <ArrowDownIcon /> : null}
      {sortDirection === "descending" ? <ArrowUpIcon /> : null}
    </span>
  );
};
