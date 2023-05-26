import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { GridCellProps } from "../GridColumn";

import { Cell } from "./Cell";

import fakeCellCss from "./FakeCell.css";

export type FakeCellProps<T> = Pick<GridCellProps<T>, "row">;

// When there is unused space (total width of all columns is less than the
// available client width of the grid) a column with fake cells is rendered to
// fill this space. Zebra and row selection/hover highlighting is applied to
// this column. Fake cells can't have keyboard focus or render any values.
export function FakeCell<T>(props: FakeCellProps<T>) {
  const { row } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-fake-cell",
    css: fakeCellCss,
    window: targetWindow,
  });

  return (
    <Cell
      className="saltGridFakeCell"
      data-row-index={row.index}
      data-column-index={-1}
    />
  );
}
