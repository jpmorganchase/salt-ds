import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { GroupHeaderCell } from "../GroupHeaderCell";
import { GridColumnGroupModel } from "../Grid";
import { GroupHeaderCellValue } from "../GroupHeaderCellValue";

import { FakeGroupCell } from "./FakeGroupCell";

import groupHeaderRowCss from "./GroupHeaderRow.css";

const withBaseName = makePrefixer("saltGridGroupHeaderRow");

export interface GroupHeaderRowProps<T> {
  groups: GridColumnGroupModel[];
  gap?: number;
}

export function GroupHeaderRow<T>(props: GroupHeaderRowProps<T>) {
  const { groups, gap } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-group-header-row",
    css: groupHeaderRowCss,
    window: targetWindow,
  });

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
