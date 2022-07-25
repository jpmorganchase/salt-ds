import { Column } from "../model";
import "./FooterRow.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridFooterRow");

export interface FooterRowProps<T> {
  columns: Column<T>[];
}

const FooterCell = () => <td>Footer</td>;

export function FooterRow<T>(props: FooterRowProps<T>) {
  const { columns } = props;
  return (
    <tr className={withBaseName()}>
      {columns.map((column) => {
        return <FooterCell key={column.key} />;
      })}
    </tr>
  );
}
