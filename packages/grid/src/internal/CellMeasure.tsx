import "./CellMeasure.css";
import { useEffect, useRef } from "react";
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
  const { setRowHeight } = props;

  const density = useDensity();

  useEffect(() => {
    if (rowRef.current) {
      const height = rowRef.current.getBoundingClientRect().height;
      setRowHeight(height);
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
