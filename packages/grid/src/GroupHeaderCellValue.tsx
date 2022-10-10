import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ColumnGroupCellValueProps } from "./ColumnGroup";
import "./GroupHeaderCellValue.css";

const withBaseName = makePrefixer("uitkGridGroupHeaderCellValue");

export function GroupHeaderCellValue(props: ColumnGroupCellValueProps) {
  const { group } = props;
  const title = group.data.name;
  return <span className={withBaseName()}>{title}</span>;
}
