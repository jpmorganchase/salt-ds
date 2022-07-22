import { HeaderValueProps } from "../model";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridHeaderCell");

export const HeaderCellValue = function <T>(props: HeaderValueProps<T>) {
  const { column } = props;
  const title = column.useTitle();
  return <span className={withBaseName("text")}>{title}</span>;
};
