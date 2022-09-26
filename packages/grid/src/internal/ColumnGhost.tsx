import { CSSProperties } from "react";
import "./ColumnGhost.css";
import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import { TableBody } from "./TableBody";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ColumnDragState } from "./gridHooks";
import { GridColumnModel, GridRowModel } from "../Grid";

const withBaseName = makePrefixer("uitkGridColumnGhost");

export interface ColumnGhostProps<T> {
  dragState?: ColumnDragState;
  columns: GridColumnModel<T>[];
  rows: GridRowModel<T>[];
}

// When the user drags a column this component renders a partially transparent
// copy of the dragged column.
export function ColumnGhost<T = any>(props: ColumnGhostProps<T>) {
  if (!props.dragState) {
    return null;
  }

  const { columnIndex, x, y } = props.dragState;
  const { columns, rows } = props;
  const movingColumn = columns[columnIndex];

  const style: CSSProperties = {
    left: x,
    top: y,
  };

  return (
    <div className={withBaseName()} style={style}>
      <table>
        <TableColGroup columns={[movingColumn]} />
        <thead>
          <HeaderRow columns={[movingColumn]} />
        </thead>
        <TableBody
          columns={[movingColumn]}
          rows={rows}
          setHoverRowKey={() => {}}
        />
      </table>
    </div>
  );
}
