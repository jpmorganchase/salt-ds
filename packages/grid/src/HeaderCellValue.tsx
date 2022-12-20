import { makePrefixer } from "@salt-ds/core";
import { GridHeaderValueProps } from "./GridColumn";

const withBaseName = makePrefixer("saltGridHeaderCell");

export function HeaderCellValue<T>(props: GridHeaderValueProps<T>) {
  const { column } = props;
  const title = column.info.props.name;
  return <span className={withBaseName("text")}>{title}</span>;
}
