import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import "./TopRightPart.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel, GridColumnModel } from "../Grid";
import { GroupHeaderRow } from "./GroupHeaderRow";
import cx from "classnames";
import { useActiveOnWheel } from "./gridHooks";
import { useCursorContext } from "../CursorContext";

const withBaseName = makePrefixer("uitkGridTopRightPart");

export interface TopRightPartProps<T> {
  onWheel: EventListener;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  isRaised?: boolean;
}

export function TopRightPart<T>(props: TopRightPartProps<T>) {
  const { onWheel, columns, columnGroups, isRaised } = props;

  const tableRef = useActiveOnWheel(onWheel);
  const { cursorHeaderRowIdx } = useCursorContext();

  return (
    <div
      className={cx(withBaseName(), {
        [withBaseName("raised")]: isRaised,
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
          <HeaderRow
            columns={columns}
            rowIndex={columnGroups.length > 0 ? 2 : 1}
            cursorColHeaderIdx={cursorHeaderRowIdx}
          />
          {/*TODO Do we need a toolbar?*/}
          {/*{showToolbar ? <HeaderToolbarRow columns={rightColumns} /> : null}*/}
        </thead>
      </table>
    </div>
  );
}
