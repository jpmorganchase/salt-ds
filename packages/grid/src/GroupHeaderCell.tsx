import cn from "classnames";
import "./GroupHeaderCell.css";
import { makePrefixer } from "@salt-ds/core";
import { GridColumnGroupModel } from "./Grid";
import { ReactNode } from "react";
import { useColumnDataContext } from "./ColumnDataContext";

const withBaseName = makePrefixer("saltGridGroupHeaderCell");

export interface GroupHeaderCellProps {
  group: GridColumnGroupModel;
  children: ReactNode;
}

export function GroupHeaderCell(props: GroupHeaderCellProps) {
  const { group } = props;
  const { colSpan, columnSeparator, rowSeparator } = group;
  const { getColById } = useColumnDataContext();
  const firstChild = getColById(group.childrenIds[0]);

  return (
    <th
      className={withBaseName()}
      colSpan={colSpan}
      aria-colspan={colSpan}
      aria-colindex={(firstChild?.index ?? 0) + 1}
      data-testid="column-group-header"
      data-group-index={group.index}
      role="columnheader"
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
