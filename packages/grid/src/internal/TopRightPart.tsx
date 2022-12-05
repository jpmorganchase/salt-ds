import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import "./TopRightPart.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel, GridColumnModel } from "../Grid";
import { GroupHeaderRow } from "./GroupHeaderRow";
import cx from "classnames";
import { useActiveOnWheel } from "./gridHooks";

const withBaseName = makePrefixer("uitkGridTopRightPart");

export interface TopRightPartProps<T> {
  onWheel: EventListener;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  leftShadow?: boolean;
  bottomShadow?: boolean;
}

export function TopRightPart<T>(props: TopRightPartProps<T>) {
  const { onWheel, columns, columnGroups, leftShadow, bottomShadow } = props;

  const tableRef = useActiveOnWheel(onWheel);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      className={cx(withBaseName(), {
        [withBaseName("leftShadow")]: leftShadow,
        [withBaseName("bottomShadow")]: bottomShadow,
      })}
      data-testid="grid-top-right-part"
    >
      <table
        className={withBaseName("table")}
        ref={tableRef}
        role="presentation"
      >
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
