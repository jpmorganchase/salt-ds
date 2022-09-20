import { RefObject, WheelEventHandler } from "react";
import { TableColGroup } from "./TableColGroup";
import "./TopPart.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel, GridColumnModel } from "../Grid";
import { HeaderRow } from "./HeaderRow";
import { GroupHeaderRow } from "./GroupHeaderRow";

const withBaseName = makePrefixer("uitkGridTopPart");

export interface TopPartProps<T> {
  topRef: RefObject<HTMLDivElement>;
  onWheel: WheelEventHandler<HTMLDivElement>;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  midGap: number;
}

export function TopPart<T>(props: TopPartProps<T>) {
  const { topRef, onWheel, columns, columnGroups, midGap } = props;

  return (
    <div className={withBaseName()} ref={topRef}>
      <div className={withBaseName("space")}>
        <table onWheel={onWheel}>
          <TableColGroup columns={columns} gap={midGap} />
          <thead>
            <GroupHeaderRow groups={columnGroups} gap={midGap} />
            <HeaderRow columns={columns} gap={midGap} />
          </thead>
        </table>
      </div>
    </div>
  );
}
