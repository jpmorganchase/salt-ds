import { WheelEventHandler } from "react";
import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import "./TopRightPart.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel, GridColumnModel } from "../Grid";
import { GroupHeaderRow } from "./GroupHeaderRow";
import cx from "classnames";

const withBaseName = makePrefixer("uitkGridTopRightPart");

export interface TopRightPartProps<T> {
  onWheel: WheelEventHandler<HTMLTableElement>;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  isRaised?: boolean;
}

export function TopRightPart<T>(props: TopRightPartProps<T>) {
  const { onWheel, columns, columnGroups, isRaised } = props;

  return (
    <div
      className={cx(withBaseName(), {
        [withBaseName("raised")]: isRaised,
      })}
    >
      <table className={withBaseName("table")} onWheel={onWheel}>
        <TableColGroup columns={columns} />
        <thead>
          <GroupHeaderRow groups={columnGroups} />
          <HeaderRow columns={columns} />
          {/*TODO Do we need a toolbar?*/}
          {/*{showToolbar ? <HeaderToolbarRow columns={rightColumns} /> : null}*/}
        </thead>
      </table>
    </div>
  );
}
