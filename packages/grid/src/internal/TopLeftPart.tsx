import { WheelEventHandler } from "react";
import "./TopLeftPart.css";
import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel, GridColumnModel } from "../Grid";
import { GroupHeaderRow } from "./GroupHeaderRow";
import cx from "classnames";

const withBaseName = makePrefixer("uitkGridTopLeftPart");

export interface TopLeftPartProps<T> {
  onWheel: WheelEventHandler<HTMLTableElement>;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  isRaised?: boolean;
}

export function TopLeftPart<T>(props: TopLeftPartProps<T>) {
  const { onWheel, columns, columnGroups, isRaised } = props;

  return (
    <div
      className={cx(withBaseName(), {
        [withBaseName("raised")]: isRaised,
      })}
      data-testid="grid-top-left-part"
    >
      <table onWheel={onWheel}>
        <TableColGroup columns={columns} />
        <thead>
          <GroupHeaderRow groups={columnGroups} />
          <HeaderRow columns={columns} />
        </thead>
      </table>
    </div>
  );
}
