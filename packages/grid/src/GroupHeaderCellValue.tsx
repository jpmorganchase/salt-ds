import { ColumnGroupCellValueProps } from "./ColumnGroup";

export function GroupHeaderCellValue(props: ColumnGroupCellValueProps) {
  const { group } = props;
  const title = group.data.name;
  return <span>{title}</span>;
}
