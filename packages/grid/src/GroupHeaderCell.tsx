import cn from "classnames";
import "./GroupHeaderCell.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnGroupModel } from "./Grid";
import { ReactNode } from "react";
import { useGridContext } from "./GridContext";

const withBaseName = makePrefixer("uitkGridGroupHeaderCell");

export interface GroupHeaderCellProps {
  group: GridColumnGroupModel;
  children: ReactNode;
}

export function GroupHeaderCell(props: GroupHeaderCellProps) {
  const { group } = props;
  const { colSpan, columnSeparator, rowSeparator } = group;
  const { getColById } = useGridContext();
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
