import "./GroupHeaderRow.css";
import { GroupHeaderCell } from "../GroupHeaderCell";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel } from "../Grid";
import { FakeGroupCell } from "./FakeGroupCell";
import { GroupHeaderCellValue } from "../GroupHeaderCellValue";

const withBaseName = makePrefixer("uitkGridGroupHeaderRow");

export interface GroupHeaderRowProps<T> {
  groups: GridColumnGroupModel[];
  gap?: number;
}

export function GroupHeaderRow<T>(props: GroupHeaderRowProps<T>) {
  const { groups, gap } = props;

  if (groups.length === 0) {
    return null;
  }
  return (
    <tr className={withBaseName()} role="row">
      {groups.map((group) => {
        const Cell = group.data.headerComponent || GroupHeaderCell;
        const CellValue =
          group.data.headerValueComponent || GroupHeaderCellValue;
        return (
          <Cell key={group.data.id} group={group}>
            <CellValue group={group} />
          </Cell>
        );
      })}
      {gap !== undefined && gap > 0 ? <FakeGroupCell /> : null}
    </tr>
  );
}
