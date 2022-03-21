import { Column } from "../model";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridHeaderToolbarRow");

export interface HeaderToolbarRowProps<T> {
  columns: Column<T>[];
}

// TODO what can be in the toolbar
const FakeToolbarCell = () => <th>Toolbar</th>;

// Toolbar row (filters should be here, what else?)
export function HeaderToolbarRow<T>(props: HeaderToolbarRowProps<T>) {
  const { columns } = props;
  return (
    <tr className={withBaseName()}>
      {columns.map((column) => {
        const Cell = column.definition.toolbarComponent || FakeToolbarCell;
        return <Cell key={column.key} />;
      })}
    </tr>
  );
}
