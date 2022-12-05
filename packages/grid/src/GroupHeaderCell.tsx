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
  const { colIndex } = group;

  return (
    <th
      className={withBaseName()}
      colSpan={colSpan}
      aria-colspan={colSpan}
      aria-colindex={colIndex + 1}
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
    </th>
  );
}
