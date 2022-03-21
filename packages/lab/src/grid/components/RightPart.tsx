import { RefObject, useMemo, WheelEventHandler } from "react";
import { useGridContext } from "../GridContext";
import cn from "classnames";
import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";
import "./RightPart.css";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridRightPart");

export interface RightPartProps<T> {
  rightRef: RefObject<HTMLDivElement>;
  onWheel: WheelEventHandler<HTMLTableElement>;
}

// Scrollable part of the columns pinned to the right. Can be scrolled up and
// down. Virtualized. Can be raised, renders with a shadow on the left then.
export function RightPart<T>(props: RightPartProps<T>) {
  const { rightRef, onWheel } = props;
  const { model } = useGridContext();

  const totalHeight = model.useTotalHeight();
  const rightWidth = model.useRightWidth();
  const isRaised = model.useIsRightRaised();
  const rightColumns = model.useRightColumns();
  const visibleRows = model.useRows();
  const bodyVisibleAreaTop = model.useBodyVisibleAreaTop();

  const spaceStyle = useMemo(() => {
    return {
      height: `${totalHeight}px`,
      width: `${rightWidth}px`,
    };
  }, [totalHeight, rightWidth]);

  const tableStyle = useMemo(() => {
    return {
      top: `${bodyVisibleAreaTop}px`,
      width: `${rightWidth}px`,
    };
  }, [bodyVisibleAreaTop, rightWidth]);

  return (
    <div
      ref={rightRef}
      className={cn(withBaseName(), {
        [withBaseName("raised")]: isRaised,
      })}
    >
      <div className={withBaseName("space")} style={spaceStyle}>
        <table style={tableStyle} onWheel={onWheel}>
          <TableColGroup columns={rightColumns} />
          <TableBody columns={rightColumns} rows={visibleRows} />
        </table>
      </div>
    </div>
  );
}
