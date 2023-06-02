import { ReactNode } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { GridColumnGroupModel } from "./Grid";
import { useColumnDataContext } from "./ColumnDataContext";

import groupHeaderCellCss from "./GroupHeaderCell.css";

const withBaseName = makePrefixer("saltGridGroupHeaderCell");

export interface GroupHeaderCellProps {
  group: GridColumnGroupModel;
  children: ReactNode;
}

export function GroupHeaderCell(props: GroupHeaderCellProps) {
  const { group } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-group-header-cell",
    css: groupHeaderCellCss,
    window: targetWindow,
  });

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
        className={clsx({
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
