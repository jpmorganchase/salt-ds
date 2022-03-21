import { useGridContext } from "../GridContext";
import { RefObject, useMemo, WheelEventHandler } from "react";
import { TableColGroup } from "./TableColGroup";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { HeaderRow } from "./HeaderRow";
import { HeaderToolbarRow } from "./HeaderToolbarRow";
import "./TopPart.css";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridTopPart");

export interface TopPartProps<T> {
  topRef: RefObject<HTMLDivElement>;
  onWheel: WheelEventHandler<HTMLDivElement>;
}

// The header of the scrollable (unpinned) part of the grid
// Virtualized, scrolls left and right.
export function TopPart<T>(props: TopPartProps<T>) {
  const { topRef, onWheel } = props;
  const { model } = useGridContext();

  const headerVisibleColumnWidth = model.useHeaderVisibleColumnWidth();
  const headerVisibleAreaLeft = model.useHeaderVisibleAreaLeft();

  const topHeight = model.useTopHeight();
  const totalWidth = model.useTotalWidth();
  const visibleColumns = model.useHeaderVisibleColumns();
  const visibleColumnGroups = model.useVisibleColumnGroups();
  const showToolbar = model.useShowToolbar();

  const tableStyle = useMemo(() => {
    return {
      width: `${headerVisibleColumnWidth}px`,
      height: `${topHeight}px`,
      left: `${headerVisibleAreaLeft}px`,
    };
  }, [headerVisibleColumnWidth, headerVisibleAreaLeft, topHeight]);

  const spaceStyle = useMemo(() => {
    return {
      height: `${topHeight}px`,
      width: `${totalWidth}px`,
    };
  }, [topHeight, totalWidth]);

  return (
    <div className={withBaseName()} ref={topRef}>
      <div className={withBaseName("space")} style={spaceStyle}>
        <table style={tableStyle} onWheel={onWheel}>
          <TableColGroup columns={visibleColumns} />
          <thead>
            {visibleColumnGroups && (
              <GroupHeaderRow groups={visibleColumnGroups} />
            )}
            <HeaderRow columns={visibleColumns} />
            {showToolbar ? <HeaderToolbarRow columns={visibleColumns} /> : null}
          </thead>
        </table>
      </div>
    </div>
  );
}
