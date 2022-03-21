import "./CellMeasure.css";
import { useEffect, useRef } from "react";
import { useGridContext } from "../GridContext";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridCellMeasure");

export interface CellMeasureProps<T> {}

// Dummy cell rendered to measure rowHeight
// Invisible for the user
export function CellMeasure<T>(props: CellMeasureProps<T>) {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const { model } = useGridContext();

  useEffect(() => {
    if (cellRef.current) {
      const height = cellRef.current.getBoundingClientRect().height;
      // console.log(`CellMeasure sets rowHeight to ${height}`);
      model.setRowHeight(height);
    }
  }, [cellRef.current]);

  return (
    <div className={withBaseName()}>
      <table>
        <thead>
          <tr>
            <th ref={cellRef}>Invisible Cell</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}
