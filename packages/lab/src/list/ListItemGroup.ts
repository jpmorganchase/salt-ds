import { HTMLAttributes } from "react";

// Purely used as markers, props will be extracted
export interface ListItemGroupProps extends HTMLAttributes<HTMLDivElement> {
  //   children?: ListItemType | ListItemType[];
  children?: JSX.Element | JSX.Element[];
  label?: string;
}
export const ListItemGroup = (_: ListItemGroupProps) => null;
