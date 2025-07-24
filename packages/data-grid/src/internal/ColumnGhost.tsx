import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type { CSSProperties } from "react";

import type { GridColumnModel, GridRowModel } from "../Grid";
import columnGhostCss from "./ColumnGhost.css";
import type { ColumnDragState } from "./gridHooks";
import { HeaderRow } from "./HeaderRow";
import { TableBody } from "./TableBody";
import { TableColGroup } from "./TableColGroup";

const withBaseName = makePrefixer("saltGridColumnGhost");

export interface ColumnGhostProps<T> {
  dragState?: ColumnDragState;
  columns: GridColumnModel<T>[];
  rows: GridRowModel<T>[];
  zebra?: boolean;
}

// When the user drags a column this component renders a partially transparent
// copy of the dragged column.
export function ColumnGhost<T = any>(props: ColumnGhostProps<T>) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-column-ghost",
    css: columnGhostCss,
    window: targetWindow,
  });

  if (!props.dragState) {
    return null;
  }

  const { columnIndex, x, y } = props.dragState;
  const { columns, rows, zebra } = props;
  const movingColumn = columns[columnIndex];

  const style: CSSProperties = {
    left: x,
    top: y,
  };

  return (
    <div className={withBaseName()} style={style}>
      <table aria-hidden>
        <TableColGroup columns={[movingColumn]} />
        <thead>
          <HeaderRow columns={[movingColumn]} />
        </thead>
        <TableBody
          columns={[movingColumn]}
          rows={rows}
          setHoverRowKey={() => {}}
          zebra={zebra}
        />
      </table>
    </div>
  );
}
