import "./TopLeftPart.css";
import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import { makePrefixer } from "@salt-ds/core";
import { GridColumnGroupModel, GridColumnModel } from "../Grid";
import { GroupHeaderRow } from "./GroupHeaderRow";
import cx from "classnames";
import { useActiveOnWheel } from "./gridHooks";

const withBaseName = makePrefixer("saltGridTopLeftPart");

export interface TopLeftPartProps<T> {
  onWheel: EventListener;
  columns: GridColumnModel<T>[];
  columnGroups: GridColumnGroupModel[];
  rightShadow?: boolean;
  bottomShadow?: boolean;
}

export function TopLeftPart<T>(props: TopLeftPartProps<T>) {
  const { onWheel, columns, columnGroups, rightShadow, bottomShadow } = props;

  const tableRef = useActiveOnWheel(onWheel);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      className={cx(withBaseName(), {
        [withBaseName("rightShadow")]: rightShadow,
        [withBaseName("bottomShadow")]: bottomShadow,
      })}
      data-testid="grid-top-left-part"
    >
      <table ref={tableRef} role="presentation">
        <TableColGroup columns={columns} />
        <thead>
          <GroupHeaderRow groups={columnGroups} />
          <HeaderRow columns={columns} />
        </thead>
      </table>
    </div>
  );
}
