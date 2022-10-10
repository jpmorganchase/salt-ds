import "./CellMeasure.css";
import { useEffect, useRef, useState } from "react";
import { makePrefixer, useDensity } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridCellMeasure");

export interface CellMeasureProps<T> {
  setRowHeight: (rowHeight: number) => void;
}

// Renders a cell in invisible location, measures its height and provides it to
// the grid.
export function CellMeasure<T>(props: CellMeasureProps<T>) {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const heightRef = useRef<number>(-1);

  const { setRowHeight } = props;

  const density = useDensity();

  useEffect(() => {
    if (rowRef.current) {
      const height = rowRef.current.getBoundingClientRect().height;
      if (heightRef.current !== height) {
        heightRef.current = height;
        setRowHeight(height);
      }
    }
  });

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
