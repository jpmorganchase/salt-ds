import "./CellMeasure.css";
import { useEffect, useRef } from "react";
import { useGridContext } from "../GridContext";
import { makePrefixer, useDensity } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridCellMeasure");

export interface CellMeasureProps<T> {}

export function CellMeasure<T>(props: CellMeasureProps<T>) {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const rowRef = useRef<HTMLTableRowElement>(null);

  const { model } = useGridContext();
  const density = useDensity();

  useEffect(() => {
    if (rowRef.current) {
      const height = rowRef.current.getBoundingClientRect().height;
      model.setRowHeight(height);
    }
  }, [cellRef.current, density]);

  return (
    <div className={withBaseName()}>
      <table>
        <thead>
          <tr ref={rowRef}>
            <th ref={cellRef}>Invisible Cell</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}
