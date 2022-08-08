import { CSSProperties, FC } from "react";
import "./MovingColumn.css";
import { useGridContext } from "../GridContext";
import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import { TableBody } from "./TableBody";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridMovingColumn");

export interface MovingColumnProps {}

// Renders the column that is being dragged by the user.
// Looks like a partially transparent copy of one of the columns.
export const MovingColumn: FC<MovingColumnProps> = function (props) {
  const { model } = useGridContext();
  const { columnDragAndDrop } = model;
  const rows = model.useRows();
  const movingColumn = columnDragAndDrop.useMovingColumn();
  const { x, y } = columnDragAndDrop.usePosition();

  if (!movingColumn) {
    return null;
  }

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
        <TableBody columns={[movingColumn]} rows={rows} />
      </table>
    </div>
  );
};
