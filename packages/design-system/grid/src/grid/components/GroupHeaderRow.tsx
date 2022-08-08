import "./GroupHeaderRow.css";
import { ColumnGroup } from "../model";
import { GroupHeaderCell } from "./GroupHeaderCell";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkGridGroupHeaderRow");

export interface GroupHeaderRowProps<T> {
  groups: ColumnGroup<T>[];
}

export function GroupHeaderRow<T>(props: GroupHeaderRowProps<T>) {
  const { groups } = props;

  return (
    <tr className={withBaseName()}>
      {groups.map((group) => {
        const Cell = group.definition.headerComponent || GroupHeaderCell;
        return <Cell key={group.key} group={group} />;
      })}
    </tr>
  );
}
