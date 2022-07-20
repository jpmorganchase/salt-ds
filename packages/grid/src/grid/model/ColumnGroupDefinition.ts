import { ColumnDefinition } from "./ColumnDefinition";
import { ComponentType } from "react";
import { GroupHeaderCellProps } from "../components";

// External representation of a group of columns.
// The pinned property of a group has priority over pinned properties of the
// columns in the group. If a group is pinned then all columns in the group are
// pinned regardless of their individual pinned prop values.
export interface ColumnGroupDefinition<T> {
  key: string;
  columns: ColumnDefinition<T>[];
  title: string;
  pinned?: "left" | "right";
  headerComponent?: ComponentType<GroupHeaderCellProps<T>>;
}
