import { HeaderValueProps } from "../model";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridHeaderCell");

// Default component for column header cell values. Simply renders the column
// title.
export const HeaderCellValue = function <T>(props: HeaderValueProps<T>) {
  const { column } = props;
  const title = column.useTitle();
  return <span className={withBaseName("text")}>{title}</span>;
};
