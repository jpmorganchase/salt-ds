import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridHeaderValueProps } from "./GridColumn";

const withBaseName = makePrefixer("uitkGridHeaderCell");

export function HeaderCellValue<T>(props: GridHeaderValueProps<T>) {
  const { column } = props;
  const title = column.info.props.name;
  return <span className={withBaseName("text")}>{title}</span>;
}
