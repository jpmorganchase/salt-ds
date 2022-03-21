import { useMemo, WheelEventHandler } from "react";
import { useGridContext } from "../GridContext";
import "./TopLeftPart.css";
import { TableColGroup } from "./TableColGroup";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { HeaderRow } from "./HeaderRow";
import { HeaderToolbarRow } from "./HeaderToolbarRow";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridTopLeftPart");

export interface TopLeftPartProps<T> {
  onWheel: WheelEventHandler<HTMLTableElement>;
}

// The header of all columns pinned to the left
// Doesn't move, positioned in the top left corner always.
export function TopLeftPart<T>(props: TopLeftPartProps<T>) {
  const { onWheel } = props;
  const { model } = useGridContext();

  const leftWidth = model.useLeftWidth();
  const topHeight = model.useTopHeight();
  const showToolbar = model.useShowToolbar();
  const leftColumns = model.useLeftColumns();
  const leftGroups = model.useLeftColumnGroups();

  const tableStyle = useMemo(() => {
    return {
      width: `${leftWidth}px`,
      height: `${topHeight}px`,
    };
  }, [leftWidth, topHeight]);

  return (
    <div className={withBaseName()}>
      <table style={tableStyle} onWheel={onWheel}>
        <TableColGroup columns={leftColumns} />
        <thead>
          {leftGroups && <GroupHeaderRow groups={leftGroups} />}
          <HeaderRow columns={leftColumns} />
          {showToolbar ? <HeaderToolbarRow columns={leftColumns} /> : null}
        </thead>
      </table>
    </div>
  );
}
