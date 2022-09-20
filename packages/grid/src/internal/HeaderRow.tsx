import "./HeaderRow.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnModel } from "../Grid";
import { HeaderCell } from "../HeaderCell";
import { HeaderCellValue } from "../HeaderCellValue";
import { FakeHeaderCell } from "./FakeHeaderCell";

const withBaseName = makePrefixer("uitkGridHeaderRow");

export interface HeaderRowProps<T> {
  columns: GridColumnModel<T>[];
  gap?: number;
}

export function HeaderRow<T>(props: HeaderRowProps<T>) {
  const { columns, gap } = props;
  return (
    <tr className={withBaseName()}>
      {columns.map((column) => {
        const Cell = column.info.props.headerComponent || HeaderCell;
        const CellValue =
          column.info.props.headerValueComponent || HeaderCellValue;
        return (
          <Cell key={column.info.props.id} column={column}>
            <CellValue column={column} />
          </Cell>
        );
      })}
      {gap !== undefined && gap > 0 ? <FakeHeaderCell /> : null}
    </tr>
  );
}
