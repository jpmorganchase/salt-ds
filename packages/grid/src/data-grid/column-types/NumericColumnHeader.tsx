import { DataGridColumnHeaderProps } from "./DataGridColumnHeader";
import { Badge } from "@jpmorganchase/uitk-lab";
import { ArrowDownIcon, ArrowUpIcon } from "@jpmorganchase/uitk-icons";
import "./NumericColumnHeader.css";

// const withBaseName = makePrefixer("uitkDataGridNumericColumnHeader");

export const NumericColumnHeader = function NumericColumnHeader<
  TRowData,
  TColumnData
>(props: DataGridColumnHeaderProps<TRowData, TColumnData>) {
  const { column } = props;
  const title = column.definition.title;
  const sortDirection = column.useSortDirection();
  const sortPriority = column.useSortPriority();
  return (
    <span>
      {sortPriority != undefined ? (
        <Badge badgeContent={sortPriority + 1}>
          {sortDirection === "ascending" ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </Badge>
      ) : null}
      {title}
    </span>
  );
};
