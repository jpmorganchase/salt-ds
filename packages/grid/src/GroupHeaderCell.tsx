import cn from "classnames";
import "./GroupHeaderCell.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel } from "./Grid";
import { ReactNode } from "react";

const withBaseName = makePrefixer("uitkGridGroupHeaderCell");

export interface GroupHeaderCellProps {
  group: GridColumnGroupModel;
  children: ReactNode;
}

export function GroupHeaderCell(props: GroupHeaderCellProps) {
  const { group } = props;
  const { colSpan, columnSeparator, rowSeparator } = group;
  const { name } = group.data;

  return (
    <th
      className={withBaseName()}
      colSpan={colSpan}
      data-testid="column-group-header"
      data-group-index={group.index}
    >
      {props.children}
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
      {columnSeparator === "pinned" ? (
        <div className={withBaseName("pinnedSeparator")} />
      ) : null}
    </th>
  );
}
