import { RefObject } from "react";
import { TableColGroup } from "./TableColGroup";
import "./TopPart.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel, GridColumnModel } from "../Grid";
import { HeaderRow } from "./HeaderRow";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { useActiveOnWheel } from "./gridHooks";

const withBaseName = makePrefixer("uitkGridTopPart");

export interface TopPartProps<T> {
  topRef: RefObject<HTMLDivElement>;
  onWheel: EventListener;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  midGap: number;
}

export function TopPart<T>(props: TopPartProps<T>) {
  const { topRef, onWheel, columns, columnGroups, midGap } = props;

  const tableRef = useActiveOnWheel(onWheel);

  return (
    <div className={withBaseName()} ref={topRef} data-testid="grid-top-part">
      <div className={withBaseName("space")}>
        <table ref={tableRef} role="presentation">
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
