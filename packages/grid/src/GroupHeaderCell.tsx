import cn from "classnames";
import "./GroupHeaderCell.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel } from "./Grid";

const withBaseName = makePrefixer("uitkGridGroupHeaderCell");

export interface GroupHeaderCellProps {
  group: GridColumnGroupModel;
}

export function GroupHeaderCell(props: GroupHeaderCellProps) {
  const { group } = props;
  const { colSpan, columnSeparator, rowSeparator } = group;
  const { name } = group.data;

  return (
    <th className={withBaseName()} colSpan={colSpan}>
      <span className={withBaseName("text")}>{name}</span>
      <div
        className={cn({
          [withBaseName("rowSeparator")]: rowSeparator === "regular",
          [withBaseName("firstGroupRowSeparator")]: rowSeparator === "first",
          [withBaseName("lastGroupRowSeparator")]: rowSeparator === "last",
        })}
      />
      {columnSeparator === "regular" ? (
        <div className={withBaseName("columnSeparator")} />
      ) : null}
    </th>
  );
}
