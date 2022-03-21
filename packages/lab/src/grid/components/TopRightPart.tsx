import { useMemo, WheelEventHandler } from "react";
import { useGridContext } from "../GridContext";
import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import { HeaderToolbarRow } from "./HeaderToolbarRow";
import "./TopRightPart.css";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridTopRightPart");

export interface TopRightPartProps<T> {
  onWheel: WheelEventHandler<HTMLTableElement>;
}

// The header of all columns pinned to the right. Doesn't move.
export function TopRightPart<T>(props: TopRightPartProps<T>) {
  const { onWheel } = props;
  const { model } = useGridContext();

  const rightWidth = model.useRightWidth();
  const topHeight = model.useTopHeight();
  const showToolbar = model.useShowToolbar();
  const rightColumnGroups = model.useRightColumnGroups();

  const tableStyle = useMemo(() => {
    return {
      width: `${rightWidth}px`,
      height: `${topHeight}px`,
    };
  }, [rightWidth, topHeight]);

  const rightColumns = model.useRightColumns();

  return (
    <div className={withBaseName()}>
      <table
        className={withBaseName("table")}
        style={tableStyle}
        onWheel={onWheel}
      >
        <TableColGroup columns={rightColumns} />
        <thead>
          {rightColumnGroups ? (
            <GroupHeaderRow groups={rightColumnGroups} />
          ) : null}
          <HeaderRow columns={rightColumns} />
          {showToolbar ? <HeaderToolbarRow columns={rightColumns} /> : null}
        </thead>
      </table>
    </div>
  );
}
