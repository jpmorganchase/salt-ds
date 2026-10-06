import type { HTMLAttributes, ReactElement } from "react";

// Purely used as markers, props will be extracted
export interface ListItemGroupProps extends HTMLAttributes<HTMLDivElement> {
  //   children?: ListItemType | ListItemType[];
  children?: ReactElement | ReactElement[];
  label?: string;
}
export const ListItemGroup = (_: ListItemGroupProps) => null;
