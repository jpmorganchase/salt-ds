import { useGridContext } from "../GridContext";
import { RefObject, useMemo, WheelEventHandler } from "react";
import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";
import "./MiddlePart.css";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridMiddlePart");

export interface MiddlePartProps<T> {
  middleRef: RefObject<HTMLDivElement>;
  onWheel: WheelEventHandler<HTMLTableElement>;
}

// Scrollable part of the columns that are not pinned. Can be scrolled along
// both axis. Virtualized.
export function MiddlePart<T>(props: MiddlePartProps<T>) {
  const { middleRef, onWheel } = props;
  const { model } = useGridContext();

  const totalWidth = model.useTotalWidth();
  const totalHeight = model.useTotalHeight();
  const bodyVisibleAreaLeft = model.useBodyVisibleAreaLeft();
  const bodyVisibleAreaTop = model.useBodyVisibleAreaTop();
  const bodyVisibleColumnWidth = model.useBodyVisibleColumnWidth();
  const visibleColumns = model.useBodyVisibleColumns();
  const visibleRows = model.useRows();

  const spaceStyle = useMemo(() => {
    return {
      width: `${totalWidth}px`,
      height: `${totalHeight}px`,
    };
  }, [totalWidth, totalHeight]);

  const tableStyle = useMemo(() => {
    return {
      width: `${bodyVisibleColumnWidth}px`,
      top: `${bodyVisibleAreaTop}px`,
      left: `${bodyVisibleAreaLeft}px`,
    };
  }, [bodyVisibleColumnWidth, bodyVisibleAreaLeft, bodyVisibleAreaTop]);

  return (
    <div ref={middleRef} className={withBaseName()}>
      <div className={withBaseName("space")} style={spaceStyle}>
        <table style={tableStyle} onWheel={onWheel}>
          <TableColGroup columns={visibleColumns} />
          <TableBody columns={visibleColumns} rows={visibleRows} />
        </table>
      </div>
    </div>
  );
}
