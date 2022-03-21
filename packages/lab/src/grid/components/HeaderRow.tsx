import "./HeaderRow.css";
import { Column } from "../model";
import { HeaderCell } from "./HeaderCell";
import { HeaderCellValue } from "./HeaderCellValue";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridHeaderRow");

export interface HeaderRowProps<T> {
  columns: Column<T>[];
}

// Column header row
export function HeaderRow<T>(props: HeaderRowProps<T>) {
  const { columns } = props;
  return (
    <tr className={withBaseName()}>
      {columns.map((column) => {
        const Cell = column.definition.headerComponent || HeaderCell;
        const CellValue =
          column.definition.headerValueComponent || HeaderCellValue;
        return (
          <Cell key={column.key} column={column}>
            <CellValue column={column} />
          </Cell>
        );
      })}
    </tr>
  );
}
