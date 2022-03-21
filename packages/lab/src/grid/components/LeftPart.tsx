import cn from "classnames";
import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";
import { useGridContext } from "../GridContext";
import { RefObject, useMemo, WheelEventHandler } from "react";
import "./LeftPart.css";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridLeftPart");

export interface LeftPartProps<T> {
  leftRef: RefObject<HTMLDivElement>;
  onWheel: WheelEventHandler<HTMLTableElement>;
}

// Columns pinned to the left. This is the scrollable part. Scrolls up and down only.
// Virtualized, renders only the visible rows.
// Can be raised, renders with a shadow on the right then.
export function LeftPart<T>(props: LeftPartProps<T>) {
  const { leftRef, onWheel } = props;
  const { model } = useGridContext();

  const isRaised = model.useIsLeftRaised();
  const totalHeight = model.useTotalHeight();
  const leftWidth = model.useLeftWidth();
  const leftColumns = model.useLeftColumns();
  const visibleRows = model.useRows();
  const bodyVisibleAreaTop = model.useBodyVisibleAreaTop();

  const spaceStyle = useMemo(() => {
    return {
      height: `${totalHeight}px`,
      width: `${leftWidth}px`,
    };
  }, [totalHeight, leftWidth]);

  const tableStyle = useMemo(() => {
    return {
      top: `${bodyVisibleAreaTop}px`,
      width: `${leftWidth}px`,
    };
  }, [bodyVisibleAreaTop, leftWidth]);

  return (
    <div
      ref={leftRef}
      className={cn(withBaseName(), {
        [withBaseName("raised")]: isRaised,
      })}
    >
      <div className={withBaseName("space")} style={spaceStyle}>
        <table style={tableStyle} onWheel={onWheel}>
          <TableColGroup columns={leftColumns} />
          <TableBody columns={leftColumns} rows={visibleRows} />
        </table>
      </div>
    </div>
  );
}
