import { ColumnGroup, useObservable } from "../model";
import cn from "classnames";
import "./GroupHeaderCell.css";
import { makePrefixer } from "@brandname/core";

const withBaseName = makePrefixer("uitkGridGroupHeaderCell");

export interface GroupHeaderCellProps<T> {
  group: ColumnGroup<T>;
}

// Column group cell
export function GroupHeaderCell<T>(props: GroupHeaderCellProps<T>) {
  const { group } = props;

  const rowSeparator = useObservable(group.rowSeparator);
  const columnSeparator = useObservable(group.columnSeparator);
  const colSpan = useObservable<number>(group.colSpan);
  const title = useObservable<string>(group.title);

  return (
    <th className={withBaseName()} colSpan={colSpan}>
      <span className={withBaseName("text")}>{title}</span>
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
