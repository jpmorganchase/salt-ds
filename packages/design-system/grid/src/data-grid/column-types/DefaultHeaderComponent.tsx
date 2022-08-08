import { Badge } from "@jpmorganchase/uitk-lab";
import { ArrowDownIcon, ArrowUpIcon } from "@jpmorganchase/uitk-icons";
import { DataGridColumnHeaderProps } from "./DataGridColumnHeader";

export const DefaultHeaderComponent = function DefaultHeaderComponent<
  TRowData,
  TColumnData
>(props: DataGridColumnHeaderProps<TRowData, TColumnData>) {
  const { column } = props;
  const title = column.definition.title;
  const sortDirection = column.useSortDirection();
  const sortPriority = column.useSortPriority();
  return (
    <span>
      {title}
      {sortPriority != undefined ? (
        <Badge badgeContent={sortPriority + 1}>
          {sortDirection === "ascending" ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </Badge>
      ) : null}
    </span>
  );
};
