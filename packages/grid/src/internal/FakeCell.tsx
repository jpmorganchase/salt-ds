import { GridCellProps } from "../GridColumn";
import "./FakeCell.css";

export type FakeCellProps<T> = Pick<GridCellProps<T>, "row">;

// When there is unused space (total width of all columns is less than the
// available client width of the grid) a column with fake cells is rendered to
// fill this space. Zebra and row selection/hover highlighting is applied to
// this column. Fake cells can't have keyboard focus or render any values.
export function FakeCell<T>(props: FakeCellProps<T>) {
  const { row } = props;
  return (
    <td
      className="uitkGridFakeCell"
      data-row-index={row.index}
      data-column-index={-1}
    />
  );
}
